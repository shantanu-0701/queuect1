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
exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("../types/config");
/**
 * Configuration Manager
 */
class ConfigManager {
    constructor(configPath = './data/config.json') {
        this.configPath = configPath;
        this.config = this.load();
    }
    /**
     * Load configuration from file or use defaults
     */
    load() {
        try {
            if (fs.existsSync(this.configPath)) {
                const data = fs.readFileSync(this.configPath, 'utf-8');
                return { ...config_1.DEFAULT_CONFIG, ...JSON.parse(data) };
            }
        }
        catch (error) {
            console.warn('Failed to load config, using defaults:', error);
        }
        return { ...config_1.DEFAULT_CONFIG };
    }
    /**
     * Save configuration to file
     */
    save() {
        const dir = path.dirname(this.configPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    }
    /**
     * Get configuration value
     */
    get(key) {
        return this.config[key];
    }
    /**
     * Get all configuration
     */
    getAll() {
        return { ...this.config };
    }
    /**
     * Set configuration value
     */
    set(key, value) {
        this.config[key] = value;
        this.save();
    }
    /**
     * Reset to defaults
     */
    reset() {
        this.config = { ...config_1.DEFAULT_CONFIG };
        this.save();
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map