import * as fs from 'fs';
import * as path from 'path';
import { Config, DEFAULT_CONFIG } from '../types/config';

/**
 * Configuration Manager
 */
export class ConfigManager {
  private configPath: string;
  private config: Config;

  constructor(configPath: string = './data/config.json') {
    this.configPath = configPath;
    this.config = this.load();
  }

  /**
   * Load configuration from file or use defaults
   */
  private load(): Config {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
      }
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error);
    }
    return { ...DEFAULT_CONFIG };
  }

  /**
   * Save configuration to file
   */
  private save(): void {
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * Get configuration value
   */
  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }

  /**
   * Get all configuration
   */
  getAll(): Config {
    return { ...this.config };
  }

  /**
   * Set configuration value
   */
  set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.config[key] = value;
    this.save();
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.save();
  }
}

