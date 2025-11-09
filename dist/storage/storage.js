"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * File-based storage for jobs
 */
class Storage {
    constructor(storagePath = './data') {
        this.filePath = path.join(storagePath, 'jobs.json');
        this.ensureDirectoryExists();
    }
    /**
     * Ensure the storage directory exists
     */
    ensureDirectoryExists() {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
        }
    }
    /**
     * Read all jobs from storage
     */
    readAll() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Write all jobs to storage
     */
    writeAll(jobs) {
        fs.writeFileSync(this.filePath, JSON.stringify(jobs, null, 2));
    }
    /**
     * Find a job by ID
     */
    findById(id) {
        const jobs = this.readAll();
        return jobs.find(job => job.id === id);
    }
    /**
     * Save or update a job
     */
    save(job) {
        const jobs = this.readAll();
        const index = jobs.findIndex(j => j.id === job.id);
        if (index >= 0) {
            jobs[index] = job;
        }
        else {
            jobs.push(job);
        }
        this.writeAll(jobs);
    }
    /**
     * Delete a job
     */
    delete(id) {
        const jobs = this.readAll();
        const filtered = jobs.filter(j => j.id !== id);
        this.writeAll(filtered);
    }
    /**
     * Get all jobs by state
     */
    findByState(state) {
        const jobs = this.readAll();
        return jobs.filter(job => job.state === state);
    }
}
exports.Storage = Storage;
//# sourceMappingURL=storage.js.map