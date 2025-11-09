/**
 * Basic test structure for queue functionality
 * 
 * To run tests:
 * npm install --save-dev jest @types/jest ts-jest
 * npm test
 */

import { Queue } from '../src/queue/queue';
import { Storage } from '../src/storage/storage';
import { JobState } from '../src/types/job';

describe('Queue', () => {
  let queue: Queue;
  let storage: Storage;

  beforeEach(() => {
    // Use a test storage path
    storage = new Storage('./test-data');
    queue = new Queue(storage);
  });

  test('should enqueue a job', () => {
    const job = queue.enqueue({
      id: 'test-job-1',
      command: 'echo hello',
      max_retries: 3
    });

    expect(job.id).toBe('test-job-1');
    expect(job.state).toBe(JobState.PENDING);
    expect(job.attempts).toBe(0);
  });

  test('should dequeue a pending job', () => {
    queue.enqueue({
      id: 'test-job-2',
      command: 'echo hello'
    });

    const job = queue.dequeue();
    expect(job).not.toBeNull();
    expect(job?.state).toBe(JobState.PROCESSING);
  });
});

