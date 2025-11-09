"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const job_1 = require("../types/job");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Worker process that executes jobs
 */
class Worker {
    constructor(queue, dlq, config) {
        this.running = false;
        this.processing = false;
        this.queue = queue;
        this.dlq = dlq;
        this.config = config;
    }
    /**
     * Start the worker
     */
    async start() {
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
    async stop() {
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
    async processNextJob() {
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
        }
        catch (error) {
            console.error(`Error processing job ${job.id}:`, error);
        }
        finally {
            this.processing = false;
        }
    }
    /**
     * Check failed jobs and reschedule if retry time has passed
     */
    checkAndRescheduleFailedJobs() {
        const failedJobs = this.queue.getByState(job_1.JobState.FAILED);
        const now = new Date();
        failedJobs.forEach(job => {
            if (job.next_retry_at) {
                const retryTime = new Date(job.next_retry_at);
                if (retryTime <= now) {
                    job.state = job_1.JobState.PENDING;
                    job.next_retry_at = undefined;
                    this.queue.updateJob(job);
                }
            }
        });
    }
    /**
     * Execute a job
     */
    async executeJob(job) {
        try {
            const { stdout, stderr } = await execAsync(job.command);
            if (stdout) {
                console.log(`[Job ${job.id}] Output: ${stdout}`);
            }
            if (stderr) {
                console.error(`[Job ${job.id}] Error: ${stderr}`);
            }
            // Job completed successfully
            job.state = job_1.JobState.COMPLETED;
            job.updated_at = new Date().toISOString();
            this.queue.updateJob(job);
        }
        catch (error) {
            // Job failed
            await this.handleJobFailure(job, error);
        }
    }
    /**
     * Handle job failure with retry logic
     */
    async handleJobFailure(job, error) {
        job.attempts += 1;
        job.error = error.message || String(error);
        if (job.attempts >= job.max_retries) {
            // Move to DLQ
            job.state = job_1.JobState.DEAD;
            job.updated_at = new Date().toISOString();
            this.queue.updateJob(job);
            this.dlq.add(job);
            console.log(`Job ${job.id} moved to DLQ after ${job.attempts} attempts`);
        }
        else {
            // Schedule retry with exponential backoff
            const delay = Math.pow(this.config.backoff_base, job.attempts);
            const nextRetry = new Date(Date.now() + delay * 1000);
            job.state = job_1.JobState.FAILED;
            job.next_retry_at = nextRetry.toISOString();
            job.updated_at = new Date().toISOString();
            this.queue.updateJob(job);
            console.log(`Job ${job.id} failed (attempt ${job.attempts}/${job.max_retries}). Retrying in ${delay}s`);
            // After delay, move back to pending
            setTimeout(() => {
                if (job.state === job_1.JobState.FAILED) {
                    job.state = job_1.JobState.PENDING;
                    job.next_retry_at = undefined;
                    this.queue.updateJob(job);
                }
            }, delay * 1000);
        }
    }
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.Worker = Worker;
//# sourceMappingURL=worker.js.map