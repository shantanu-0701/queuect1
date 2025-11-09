import { Job, JobState } from '../types/job';
import { Storage } from '../storage/storage';

/**
 * Dead Letter Queue Manager
 */
export class DLQ {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  /**
   * Add a job to the DLQ
   */
  add(job: Job): void {
    job.state = JobState.DEAD;
    job.updated_at = new Date().toISOString();
    this.storage.save(job);
  }

  /**
   * Get all jobs in DLQ
   */
  getAll(): Job[] {
    return this.storage.findByState(JobState.DEAD);
  }

  /**
   * Get a job from DLQ by ID
   */
  getById(id: string): Job | undefined {
    const job = this.storage.findById(id);
    return job && job.state === JobState.DEAD ? job : undefined;
  }

  /**
   * Remove a job from DLQ
   */
  remove(id: string): void {
    this.storage.delete(id);
  }

  /**
   * Clear all jobs from DLQ
   */
  clear(): void {
    const jobs = this.getAll();
    jobs.forEach(job => this.storage.delete(job.id));
  }
}

