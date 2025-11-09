import { Job } from '../types/job';
/**
 * File-based storage for jobs
 */
export declare class Storage {
    private filePath;
    constructor(storagePath?: string);
    /**
     * Ensure the storage directory exists
     */
    private ensureDirectoryExists;
    /**
     * Read all jobs from storage
     */
    readAll(): Job[];
    /**
     * Write all jobs to storage
     */
    writeAll(jobs: Job[]): void;
    /**
     * Find a job by ID
     */
    findById(id: string): Job | undefined;
    /**
     * Save or update a job
     */
    save(job: Job): void;
    /**
     * Delete a job
     */
    delete(id: string): void;
    /**
     * Get all jobs by state
     */
    findByState(state: string): Job[];
}
//# sourceMappingURL=storage.d.ts.map