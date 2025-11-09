/**
 * Job state enumeration
 */
export enum JobState {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DEAD = 'dead'
}

/**
 * Job interface matching the specification
 */
export interface Job {
  id: string;
  command: string;
  state: JobState;
  attempts: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
  error?: string;
  next_retry_at?: string;
}

/**
 * Job creation input (without auto-generated fields)
 */
export interface JobInput {
  id: string;
  command: string;
  max_retries?: number;
}

