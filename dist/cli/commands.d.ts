import { Command } from 'commander';
/**
 * CLI Commands
 */
export declare class CLICommands {
    private queue;
    private dlq;
    private storage;
    private config;
    private workers;
    private isWorkerRunning;
    constructor();
    /**
     * Register all CLI commands
     */
    registerCommands(program: Command): void;
    /**
     * Stop all workers gracefully
     */
    private stopWorkers;
    /**
     * Get color function for job state
     */
    private getStateColor;
}
//# sourceMappingURL=commands.d.ts.map