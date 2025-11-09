import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../types/job';

/**
 * File-based storage for jobs
 */
export class Storage {
  private filePath: string;

  constructor(storagePath: string = './data') {
    this.filePath = path.join(storagePath, 'jobs.json');
    this.ensureDirectoryExists();
  }

  /**
   * Ensure the storage directory exists
   */
  private ensureDirectoryExists(): void {
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
  readAll(): Job[] {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  /**
   * Write all jobs to storage
   */
  writeAll(jobs: Job[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(jobs, null, 2));
  }

  /**
   * Find a job by ID
   */
  findById(id: string): Job | undefined {
    const jobs = this.readAll();
    return jobs.find(job => job.id === id);
  }

  /**
   * Save or update a job
   */
  save(job: Job): void {
    const jobs = this.readAll();
    const index = jobs.findIndex(j => j.id === job.id);
    
    if (index >= 0) {
      jobs[index] = job;
    } else {
      jobs.push(job);
    }
    
    this.writeAll(jobs);
  }

  /**
   * Delete a job
   */
  delete(id: string): void {
    const jobs = this.readAll();
    const filtered = jobs.filter(j => j.id !== id);
    this.writeAll(filtered);
  }

  /**
   * Get all jobs by state
   */
  findByState(state: string): Job[] {
    const jobs = this.readAll();
    return jobs.filter(job => job.state === state);
  }
}

