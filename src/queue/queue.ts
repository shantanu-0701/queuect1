import { v4 as uuidv4 } from 'uuid';
import { Job, JobState, JobInput } from '../types/job';
import { Storage } from '../storage/storage';

/**
 * Job Queue Manager
 */
export class Queue {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  /**
   * Create and enqueue a new job
   */
  enqueue(input: JobInput): Job {
    const now = new Date().toISOString();
    
    const job: Job = {
      id: input.id,
      command: input.command,
      state: JobState.PENDING,
      attempts: 0,
      max_retries: input.max_retries ?? 3,
      created_at: now,
      updated_at: now
    };

    this.storage.save(job);
    return job;
  }

  /**
   * Get the next pending job (with locking)
   */
  dequeue(): Job | null {
    const jobs = this.storage.findByState(JobState.PENDING);
    
    if (jobs.length === 0) {
      return null;
    }

    // Get the oldest pending job
    const sorted = jobs.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const job = sorted[0];
    job.state = JobState.PROCESSING;
    job.updated_at = new Date().toISOString();
    this.storage.save(job);

    return job;
  }

  /**
   * Update job state
   */
  updateJob(job: Job): void {
    job.updated_at = new Date().toISOString();
    this.storage.save(job);
  }

  /**
   * Get all jobs
   */
  getAll(): Job[] {
    return this.storage.readAll();
  }

  /**
   * Get jobs by state
   */
  getByState(state: JobState): Job[] {
    return this.storage.findByState(state);
  }

  /**
   * Get a job by ID
   */
  getById(id: string): Job | undefined {
    return this.storage.findById(id);
  }
}

