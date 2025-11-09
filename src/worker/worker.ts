import { exec } from 'child_process';
import { promisify } from 'util';
import { Job, JobState } from '../types/job';
import { Queue } from '../queue/queue';
import { DLQ } from '../dlq/dlq';
import { Config } from '../types/config';

const execAsync = promisify(exec);

/**
 * Worker process that executes jobs
 */
export class Worker {
  private queue: Queue;
  private dlq: DLQ;
  private config: Config;
  private running: boolean = false;
  private processing: boolean = false;

  constructor(queue: Queue, dlq: DLQ, config: Config) {
    this.queue = queue;
    this.dlq = dlq;
    this.config = config;
  }

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    this.running = true;
    console.log('Worker started');
    
    while (this.running) {
      await this.processNextJob();
      // Small delay to prevent busy waiting
      await this.sleep(100);
    }
  }

  /**
   * Stop the worker gracefully
   */
  async stop(): Promise<void> {
    console.log('Stopping worker...');
    this.running = false;
    
    // Wait for current job to finish
    while (this.processing) {
      await this.sleep(100);
    }
    
    console.log('Worker stopped');
  }

  /**
   * Process the next available job
   */
  private async processNextJob(): Promise<void> {
    if (this.processing) {
      return;
    }

    // Check for failed jobs ready to retry
    this.checkAndRescheduleFailedJobs();

    const job = this.queue.dequeue();
    if (!job) {
      return;
    }

    this.processing = true;
    
    try {
      await this.executeJob(job);
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Check failed jobs and reschedule if retry time has passed
   */
  private checkAndRescheduleFailedJobs(): void {
    const failedJobs = this.queue.getByState(JobState.FAILED);
    const now = new Date();

    failedJobs.forEach(job => {
      if (job.next_retry_at) {
        const retryTime = new Date(job.next_retry_at);
        if (retryTime <= now) {
          job.state = JobState.PENDING;
          job.next_retry_at = undefined;
          this.queue.updateJob(job);
        }
      }
    });
  }

  /**
   * Execute a job
   */
  private async executeJob(job: Job): Promise<void> {
    try {
      const { stdout, stderr } = await execAsync(job.command);
      
      if (stdout) {
        console.log(`[Job ${job.id}] Output: ${stdout}`);
      }
      if (stderr) {
        console.error(`[Job ${job.id}] Error: ${stderr}`);
      }

      // Job completed successfully
      job.state = JobState.COMPLETED;
      job.updated_at = new Date().toISOString();
      this.queue.updateJob(job);
      
    } catch (error: any) {
      // Job failed
      await this.handleJobFailure(job, error);
    }
  }

  /**
   * Handle job failure with retry logic
   */
  private async handleJobFailure(job: Job, error: any): Promise<void> {
    job.attempts += 1;
    job.error = error.message || String(error);

    if (job.attempts >= job.max_retries) {
      // Move to DLQ
      job.state = JobState.DEAD;
      job.updated_at = new Date().toISOString();
      this.queue.updateJob(job);
      this.dlq.add(job);
      console.log(`Job ${job.id} moved to DLQ after ${job.attempts} attempts`);
    } else {
      // Schedule retry with exponential backoff
      const delay = Math.pow(this.config.backoff_base, job.attempts);
      const nextRetry = new Date(Date.now() + delay * 1000);
      
      job.state = JobState.FAILED;
      job.next_retry_at = nextRetry.toISOString();
      job.updated_at = new Date().toISOString();
      this.queue.updateJob(job);

      console.log(`Job ${job.id} failed (attempt ${job.attempts}/${job.max_retries}). Retrying in ${delay}s`);
      
      // After delay, move back to pending
      setTimeout(() => {
        if (job.state === JobState.FAILED) {
          job.state = JobState.PENDING;
          job.next_retry_at = undefined;
          this.queue.updateJob(job);
        }
      }, delay * 1000);
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

