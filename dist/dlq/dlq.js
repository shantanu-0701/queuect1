"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLQ = void 0;
const job_1 = require("../types/job");
/**
 * Dead Letter Queue Manager
 */
class DLQ {
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * Add a job to the DLQ
     */
    add(job) {
        job.state = job_1.JobState.DEAD;
        job.updated_at = new Date().toISOString();
        this.storage.save(job);
    }
    /**
     * Get all jobs in DLQ
     */
    getAll() {
        return this.storage.findByState(job_1.JobState.DEAD);
    }
    /**
     * Get a job from DLQ by ID
     */
    getById(id) {
        const job = this.storage.findById(id);
        return job && job.state === job_1.JobState.DEAD ? job : undefined;
    }
    /**
     * Remove a job from DLQ
     */
    remove(id) {
        this.storage.delete(id);
    }
    /**
     * Clear all jobs from DLQ
     */
    clear() {
        const jobs = this.getAll();
        jobs.forEach(job => this.storage.delete(job.id));
    }
}
exports.DLQ = DLQ;
//# sourceMappingURL=dlq.js.map