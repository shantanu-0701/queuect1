#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const commands_1 = require("./cli/commands");
const program = new commander_1.Command();
program
    .name('queuectl')
    .description('CLI-based background job queue system')
    .version('1.0.0');
// Register all commands
const cliCommands = new commands_1.CLICommands();
cliCommands.registerCommands(program);
// Parse arguments
program.parse();
//# sourceMappingURL=index.js.map