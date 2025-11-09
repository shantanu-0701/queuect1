"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const job_1 = require("../types/job");
/**
 * Job Queue Manager
 */
class Queue {
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * Create and enqueue a new job
     */
    enqueue(input) {
        const now = new Date().toISOString();
        const job = {
            id: input.id,
            command: input.command,
            state: job_1.JobState.PENDING,
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
    dequeue() {
        const jobs = this.storage.findByState(job_1.JobState.PENDING);
        if (jobs.length === 0) {
            return null;
        }
        // Get the oldest pending job
        const sorted = jobs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const job = sorted[0];
        job.state = job_1.JobState.PROCESSING;
        job.updated_at = new Date().toISOString();
        this.storage.save(job);
        return job;
    }
    /**
     * Update job state
     */
    updateJob(job) {
        job.updated_at = new Date().toISOString();
        this.storage.save(job);
    }
    /**
     * Get all jobs
     */
    getAll() {
        return this.storage.readAll();
    }
    /**
     * Get jobs by state
     */
    getByState(state) {
        return this.storage.findByState(state);
    }
    /**
     * Get a job by ID
     */
    getById(id) {
        return this.storage.findById(id);
    }
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map