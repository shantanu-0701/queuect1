import { Config } from '../types/config';
/**
 * Configuration Manager
 */
export declare class ConfigManager {
    private configPath;
    private config;
    constructor(configPath?: string);
    /**
     * Load configuration from file or use defaults
     */
    private load;
    /**
     * Save configuration to file
     */
    private save;
    /**
     * Get configuration value
     */
    get<K extends keyof Config>(key: K): Config[K];
    /**
     * Get all configuration
     */
    getAll(): Config;
    /**
     * Set configuration value
     */
    set<K extends keyof Config>(key: K, value: Config[K]): void;
    /**
     * Reset to defaults
     */
    reset(): void;
}
//# sourceMappingURL=config.d.ts.map