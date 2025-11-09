/**
 * Application configuration
 */
export interface Config {
  max_retries: number;
  backoff_base: number;
  storage_path: string;
  worker_count: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Config = {
  max_retries: 3,
  backoff_base: 2,
  storage_path: './data',
  worker_count: 1
};

