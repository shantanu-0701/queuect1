#!/usr/bin/env node

import { Command } from 'commander';
import { CLICommands } from './cli/commands';

const program = new Command();

program
  .name('queuectl')
  .description('CLI-based background job queue system')
  .version('1.0.0');

// Register all commands
const cliCommands = new CLICommands();
cliCommands.registerCommands(program);

// Parse arguments
program.parse();

