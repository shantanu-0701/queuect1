import { Queue } from '../queue/queue';
import { DLQ } from '../dlq/dlq';
import { Config } from '../types/config';
/**
 * Worker process that executes jobs
 */
export declare class Worker {
    private queue;
    private dlq;
    private config;
    private running;
    private processing;
    constructor(queue: Queue, dlq: DLQ, config: Config);
    /**
     * Start the worker
     */
    start(): Promise<void>;
    /**
     * Stop the worker gracefully
     */
    stop(): Promise<void>;
    /**
     * Process the next available job
     */
    private processNextJob;
    /**
     * Check failed jobs and reschedule if retry time has passed
     */
    private checkAndRescheduleFailedJobs;
    /**
     * Execute a job
     */
    private executeJob;
    /**
     * Handle job failure with retry logic
     */
    private handleJobFailure;
    /**
     * Sleep utility
     */
    private sleep;
}
//# sourceMappingURL=worker.d.ts.map