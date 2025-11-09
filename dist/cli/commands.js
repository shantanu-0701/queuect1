"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLICommands = void 0;
const chalk_1 = __importDefault(require("chalk"));
const queue_1 = require("../queue/queue");
const dlq_1 = require("../dlq/dlq");
const storage_1 = require("../storage/storage");
const config_1 = require("../config/config");
const worker_1 = require("../worker/worker");
const job_1 = require("../types/job");
/**
 * CLI Commands
 */
class CLICommands {
    constructor() {
        this.workers = [];
        this.isWorkerRunning = false;
        this.storage = new storage_1.Storage();
        this.queue = new queue_1.Queue(this.storage);
        this.dlq = new dlq_1.DLQ(this.storage);
        this.config = new config_1.ConfigManager();
    }
    /**
     * Register all CLI commands
     */
    registerCommands(program) {
        // Enqueue command
        program
            .command('enqueue')
            .description('Add a new job to the queue')
            .argument('<job-json>', 'Job JSON string')
            .action((jobJson) => {
            try {
                // Handle PowerShell quote escaping - reconstruct from process.argv if needed
                let jsonString = jobJson;
                // If JSON is missing quotes (PowerShell stripped them), try to reconstruct
                if (jsonString.includes(':') && !jsonString.includes('"')) {
                    // Reconstruct from all args after 'enqueue'
                    const args = process.argv.slice(process.argv.indexOf('enqueue') + 1);
                    const joined = args.join(' ');
                    // Try to fix common PowerShell issues: {id:value,key:value} -> {"id":"value","key":"value"}
                    jsonString = joined
                        .replace(/{([^}]+)}/, (match, content) => {
                        const pairs = content.split(',').map((pair) => {
                            const [key, ...valueParts] = pair.split(':');
                            const value = valueParts.join(':').trim();
                            const numValue = parseFloat(value);
                            const quotedValue = isNaN(numValue) ? `"${value}"` : value;
                            return `"${key.trim()}":${quotedValue}`;
                        });
                        return `{${pairs.join(',')}}`;
                    });
                }
                // Try to parse - if it fails, try reconstructing from process.argv
                let input;
                try {
                    input = JSON.parse(jsonString);
                }
                catch (parseError) {
                    // Reconstruct from all args after 'enqueue'
                    const args = process.argv.slice(process.argv.indexOf('enqueue') + 1);
                    const joined = args.join(' ');
                    // Fix PowerShell issues: {id:value,key:value} -> {"id":"value","key":"value"}
                    const fixed = joined
                        .replace(/{([^}]+)}/, (match, content) => {
                        const pairs = content.split(',').map((pair) => {
                            const [key, ...valueParts] = pair.split(':');
                            const value = valueParts.join(':').trim();
                            const numValue = parseFloat(value);
                            const quotedValue = isNaN(numValue) ? `"${value}"` : value;
                            return `"${key.trim()}":${quotedValue}`;
                        });
                        return `{${pairs.join(',')}}`;
                    });
                    input = JSON.parse(fixed);
                }
                // Use config max_retries as default if not specified in job
                if (!input.max_retries) {
                    input.max_retries = this.config.get('max_retries');
                }
                else {
                    // Enforce config max_retries as maximum limit
                    const configMaxRetries = this.config.get('max_retries');
                    if (input.max_retries > configMaxRetries) {
                        console.warn(chalk_1.default.yellow(`Warning: Job max_retries (${input.max_retries}) exceeds config limit (${configMaxRetries}). Using config limit.`));
                        input.max_retries = configMaxRetries;
                    }
                }
                const job = this.queue.enqueue(input);
                console.log(chalk_1.default.green(`Job ${job.id} enqueued successfully`));
            }
            catch (error) {
                console.error(chalk_1.default.red(`Error: ${error.message}`));
                console.error(chalk_1.default.yellow(`Received JSON: ${jobJson}`));
                process.exit(1);
            }
        });
        // Status command
        program
            .command('status')
            .description('Show summary of all job states & active workers')
            .action(() => {
            const allJobs = this.queue.getAll();
            const pending = this.queue.getByState(job_1.JobState.PENDING);
            const processing = this.queue.getByState(job_1.JobState.PROCESSING);
            const completed = this.queue.getByState(job_1.JobState.COMPLETED);
            const failed = this.queue.getByState(job_1.JobState.FAILED);
            const dead = this.dlq.getAll();
            console.log(chalk_1.default.blue('\n=== Queue Status ===\n'));
            console.log(`${chalk_1.default.bold('Total Jobs:')} ${allJobs.length}`);
            console.log(`${chalk_1.default.yellow('Pending:')} ${pending.length}`);
            console.log(`${chalk_1.default.blue('Processing:')} ${processing.length}`);
            console.log(`${chalk_1.default.green('Completed:')} ${completed.length}`);
            console.log(`${chalk_1.default.magenta('Failed:')} ${failed.length}`);
            console.log(`${chalk_1.default.red('Dead (DLQ):')} ${dead.length}`);
            console.log(`${chalk_1.default.bold('Active Workers:')} ${this.workers.length}`);
            console.log('');
        });
        // List jobs
        program
            .command('list')
            .description('List all jobs')
            .option('-s, --state <state>', 'Filter by state')
            .action((options) => {
            const jobs = options.state
                ? this.queue.getByState(options.state)
                : this.queue.getAll();
            if (jobs.length === 0) {
                console.log(chalk_1.default.yellow('No jobs found'));
                return;
            }
            console.log(chalk_1.default.blue(`\nFound ${jobs.length} job(s):\n`));
            jobs.forEach(job => {
                const stateColor = this.getStateColor(job.state);
                console.log(`${chalk_1.default.bold('ID:')} ${job.id}`);
                console.log(`${chalk_1.default.bold('Command:')} ${job.command}`);
                console.log(`${chalk_1.default.bold('State:')} ${stateColor(job.state)}`);
                console.log(`${chalk_1.default.bold('Attempts:')} ${job.attempts}/${job.max_retries}`);
                console.log(`${chalk_1.default.bold('Created:')} ${job.created_at}`);
                if (job.error) {
                    console.log(`${chalk_1.default.bold('Error:')} ${chalk_1.default.red(job.error)}`);
                }
                console.log('');
            });
        });
        // Worker commands
        const workerCmd = program
            .command('worker')
            .description('Manage worker processes');
        workerCmd
            .command('start')
            .description('Start worker processes')
            .option('-c, --count <number>', 'Number of workers', '1')
            .action(async (options) => {
            const count = parseInt(options.count, 10);
            console.log(chalk_1.default.blue(`Starting ${count} worker(s)...`));
            this.isWorkerRunning = true;
            for (let i = 0; i < count; i++) {
                const worker = new worker_1.Worker(this.queue, this.dlq, this.config.getAll());
                this.workers.push(worker);
                worker.start();
            }
            // Handle graceful shutdown
            process.on('SIGINT', async () => {
                await this.stopWorkers();
                process.exit(0);
            });
            // Keep process alive
            process.stdin.resume();
        });
        workerCmd
            .command('stop')
            .description('Stop running workers gracefully')
            .action(async () => {
            if (this.workers.length === 0) {
                console.log(chalk_1.default.yellow('No workers are running'));
                return;
            }
            await this.stopWorkers();
        });
        // DLQ commands
        const dlqCmd = program
            .command('dlq')
            .description('Dead Letter Queue operations');
        dlqCmd
            .command('list')
            .description('List all jobs in DLQ')
            .action(() => {
            const jobs = this.dlq.getAll();
            if (jobs.length === 0) {
                console.log(chalk_1.default.yellow('DLQ is empty'));
                return;
            }
            console.log(chalk_1.default.red(`\nDLQ contains ${jobs.length} job(s):\n`));
            jobs.forEach(job => {
                console.log(`${chalk_1.default.bold('ID:')} ${job.id}`);
                console.log(`${chalk_1.default.bold('Command:')} ${job.command}`);
                console.log(`${chalk_1.default.bold('Attempts:')} ${job.attempts}/${job.max_retries}`);
                console.log(`${chalk_1.default.bold('Error:')} ${chalk_1.default.red(job.error || 'Unknown')}`);
                console.log('');
            });
        });
        dlqCmd
            .command('retry')
            .description('Retry a job from DLQ')
            .argument('<job-id>', 'Job ID to retry')
            .action((jobId) => {
            const job = this.dlq.getById(jobId);
            if (!job) {
                console.error(chalk_1.default.red(`Job ${jobId} not found in DLQ`));
                process.exit(1);
            }
            // Reset job state and move back to queue
            job.state = job_1.JobState.PENDING;
            job.attempts = 0;
            job.error = undefined;
            job.next_retry_at = undefined;
            job.updated_at = new Date().toISOString();
            this.queue.updateJob(job);
            // Note: Don't call dlq.remove() - it would delete the job entirely
            // The job is already removed from DLQ by changing state to PENDING
            console.log(chalk_1.default.green(`Job ${jobId} moved back to queue for retry`));
        });
        dlqCmd
            .command('clear')
            .description('Clear all jobs from DLQ')
            .action(() => {
            this.dlq.clear();
            console.log(chalk_1.default.green('DLQ cleared'));
        });
        // Config commands
        const configCmd = program
            .command('config')
            .description('Manage configuration');
        configCmd
            .command('get')
            .description('Get configuration value')
            .argument('<key>', 'Configuration key')
            .action((key) => {
            const value = this.config.get(key);
            console.log(`${key}: ${value}`);
        });
        configCmd
            .command('set')
            .description('Set configuration value')
            .argument('<key>', 'Configuration key (supports hyphenated: max-retries, backoff-base, etc.)')
            .argument('<value>', 'Configuration value')
            .action((key, value) => {
            // Convert hyphenated keys to underscore (max-retries -> max_retries)
            const normalizedKey = key.replace(/-/g, '_');
            const numValue = parseFloat(value);
            const finalValue = isNaN(numValue) ? value : numValue;
            this.config.set(normalizedKey, finalValue);
            console.log(chalk_1.default.green(`Set ${key} = ${finalValue}`));
        });
        configCmd
            .command('list')
            .description('List all configuration')
            .action(() => {
            const config = this.config.getAll();
            console.log(chalk_1.default.blue('\nConfiguration:'));
            Object.entries(config).forEach(([key, value]) => {
                console.log(`  ${key}: ${value}`);
            });
        });
    }
    /**
     * Stop all workers gracefully
     */
    async stopWorkers() {
        if (this.workers.length === 0) {
            return;
        }
        console.log(chalk_1.default.yellow('\nShutting down workers...'));
        await Promise.all(this.workers.map(w => w.stop()));
        this.workers = [];
        this.isWorkerRunning = false;
        console.log(chalk_1.default.green('All workers stopped'));
    }
    /**
     * Get color function for job state
     */
    getStateColor(state) {
        switch (state) {
            case job_1.JobState.PENDING:
                return chalk_1.default.yellow;
            case job_1.JobState.PROCESSING:
                return chalk_1.default.blue;
            case job_1.JobState.COMPLETED:
                return chalk_1.default.green;
            case job_1.JobState.FAILED:
                return chalk_1.default.magenta;
            case job_1.JobState.DEAD:
                return chalk_1.default.red;
            default:
                return (text) => text;
        }
    }
}
exports.CLICommands = CLICommands;
//# sourceMappingURL=commands.js.map