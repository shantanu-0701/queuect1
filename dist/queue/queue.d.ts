import { Job, JobState, JobInput } from '../types/job';
import { Storage } from '../storage/storage';
/**
 * Job Queue Manager
 */
export declare class Queue {
    private storage;
    constructor(storage: Storage);
    /**
     * Create and enqueue a new job
     */
    enqueue(input: JobInput): Job;
    /**
     * Get the next pending job (with locking)
     */
    dequeue(): Job | null;
    /**
     * Update job state
     */
    updateJob(job: Job): void;
    /**
     * Get all jobs
     */
    getAll(): Job[];
    /**
     * Get jobs by state
     */
    getByState(state: JobState): Job[];
    /**
     * Get a job by ID
     */
    getById(id: string): Job | undefined;
}
//# sourceMappingURL=queue.d.ts.map