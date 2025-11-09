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
export declare const DEFAULT_CONFIG: Config;
//# sourceMappingURL=config.d.ts.map