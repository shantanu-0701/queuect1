# 🧾 QueueCTL — CLI-Based Background Job Queue System

A lightweight **command-line job queue system** built using **Node.js** and **TypeScript**.  
QueueCTL allows you to add background jobs, execute them using workers, retry failed tasks automatically with exponential backoff, and manage permanently failed jobs through a **Dead Letter Queue (DLQ)** — all from the command line.

---

##  1. Setup Instructions

###  Prerequisites
- Node.js 
- npm 

###  Installation
```bash
git clone https://github.com/shantanu-0701/queuect1.git
cd queuect1
npm install
npm run build
```
###  Run Locally
```bash
node dist/index.js --help
```
---

##  2. Usage Examples

###  Enqueue a Job
Add a new job to the queue:
```bash
node dist/index.js enqueue '{"id":"job1","command":"echo Hello World"}'

```

###  Start Worker(s)
Start background workers to process queued jobs:
```bash
node dist/index.js worker start
```

###  Check Queue Status
View the current state of all jobs:
```bash
node dist/index.js status
```

##  3. Architecture Overview

###  Storage (`src/storage/storage.ts`)
Handles **data persistence** using JSON files.  
Provides CRUD operations for jobs — add, update, retrieve, and delete.

###  Queue (`src/queue/queue.ts`)
Manages the **job lifecycle**:  
`PENDING → PROCESSING → COMPLETED / FAILED / DEAD`.  
Also tracks retries and job states.

###  Worker (`src/worker/worker.ts`)
Runs background workers that execute jobs using `child_process.exec`.  
Implements **retry logic** with exponential backoff for failed jobs.

###  Dead Letter Queue (`src/dlq/dlq.ts`)
Handles permanently failed jobs and allows retrying them manually later.

###  Config (`src/config/config.ts`)
Stores and manages runtime configurations like:  
- Max retries per job  
- Worker count  
- Backoff multiplier  
- Storage path

###  CLI Interface (`src/cli/commands.ts`)
Uses **Commander.js** for parsing commands and **Chalk** for colored terminal output.  
Commands supported include:
- `enqueue`
- `status`
- `worker start`
- `dlq list`
- `dlq retry`
- `config set/get`

---

##  4. Assumptions & Trade-offs
- JSON file-based storage chosen for simplicity and portability.  
- Focused on **modularity** over scalability (suitable for local/demo environments).  
- Workers are single-threaded (easy debugging and control).  
- Retry system uses **exponential backoff** for realistic failure handling.  
- CLI-based design keeps dependencies minimal and cross-platform.

---

##  5. Testing Instructions

###  Run All Tests
```bash
npm test
```
### Example Test File
/tests/queue.test.ts

### Verify Functionality
Follow these steps to verify everything works as expected:

1. **Add a Job**
   ```bash
   node dist/index.js enqueue '{"id":"job1","command":"echo Hello"}'
2. **Start Worker(s)**
   ```bash
   node dist/index.js worker start
3. **Check Queue Status**
   ```bash
   node dist/index.js status

4. **Retry DLQ Job**
   ```bash
   node dist/index.js dlq retry job1






