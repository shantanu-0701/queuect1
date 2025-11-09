import { Job } from '../types/job';
import { Storage } from '../storage/storage';
/**
 * Dead Letter Queue Manager
 */
export declare class DLQ {
    private storage;
    constructor(storage: Storage);
    /**
     * Add a job to the DLQ
     */
    add(job: Job): void;
    /**
     * Get all jobs in DLQ
     */
    getAll(): Job[];
    /**
     * Get a job from DLQ by ID
     */
    getById(id: string): Job | undefined;
    /**
     * Remove a job from DLQ
     */
    remove(id: string): void;
    /**
     * Clear all jobs from DLQ
     */
    clear(): void;
}
//# sourceMappingURL=dlq.d.ts.map