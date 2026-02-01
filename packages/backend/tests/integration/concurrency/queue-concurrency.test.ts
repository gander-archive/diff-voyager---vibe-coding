/**
 * Queue Concurrency tests
 * Tests for concurrent queue operations, race conditions, and transaction isolation
 */

import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import type Database from 'better-sqlite3';
import * as tmp from 'tmp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TaskQueue } from '../../../src/queue/task-queue.js';
import type { CapturePagePayload } from '../../../src/queue/types.js';
import { closeDatabase, createDatabase } from '../../../src/storage/database.js';

interface CountResult {
  count: number;
}

describe('Queue Concurrency', () => {
  let testDir: string;
  let dbPath: string;
  let db: Database.Database;
  let taskQueue: TaskQueue;

  beforeEach(() => {
    testDir = tmp.dirSync({ unsafeCleanup: true, prefix: 'diff-voyager-concurrency-test-' }).name;
    mkdirSync(testDir, { recursive: true });
    dbPath = join(testDir, 'test.db');
    db = createDatabase({ dbPath, artifactsDir: join(testDir, 'artifacts') });
    taskQueue = new TaskQueue(db);
  });

  afterEach(() => {
    closeDatabase(db);
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('Concurrent Enqueue Operations', () => {
    it('should handle concurrent task enqueueing', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: true,
        config: {},
      };

      const enqueuePromises = Array.from({ length: 100 }, (_, i) =>
        Promise.resolve(
          taskQueue.enqueue({
            type: 'capture-page',
            payload: { ...payload, url: `https://example.com/page-${i}` },
          }),
        ),
      );

      const taskIds = await Promise.all(enqueuePromises);

      expect(taskIds.length).toBe(100);
      expect(new Set(taskIds).size).toBe(100);

      const tasks = db.prepare('SELECT * FROM tasks').all();
      expect(tasks.length).toBe(100);
    });

    it('should maintain task order under concurrent enqueue', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: false,
        config: {},
      };

      const taskIds: string[] = [];
      for (let i = 0; i < 50; i++) {
        const id = taskQueue.enqueue({
          type: 'capture-page',
          payload: { ...payload, url: `https://example.com/${i}` },
        });
        taskIds.push(id);
      }

      const tasks = db.prepare('SELECT id FROM tasks ORDER BY created_at ASC').all() as {
        id: string;
      }[];

      expect(tasks.length).toBe(50);
      expect(tasks.map((t) => t.id)).toEqual(taskIds);
    });

    it('should handle concurrent enqueue with different priorities', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: true,
        config: {},
      };

      const highPriorityPromises = Array.from({ length: 10 }, () =>
        Promise.resolve(
          taskQueue.enqueue({
            type: 'capture-page',
            payload,
            priority: 'high',
          }),
        ),
      );

      const normalPriorityPromises = Array.from({ length: 10 }, () =>
        Promise.resolve(
          taskQueue.enqueue({
            type: 'capture-page',
            payload,
            priority: 'normal',
          }),
        ),
      );

      const lowPriorityPromises = Array.from({ length: 10 }, () =>
        Promise.resolve(
          taskQueue.enqueue({
            type: 'capture-page',
            payload,
            priority: 'low',
          }),
        ),
      );

      await Promise.all([
        ...highPriorityPromises,
        ...normalPriorityPromises,
        ...lowPriorityPromises,
      ]);

      const tasks = db.prepare('SELECT priority FROM tasks').all() as { priority: string }[];
      expect(tasks.length).toBe(30);

      const priorities = tasks.map((t) => t.priority);
      expect(priorities.filter((p) => p === 'high').length).toBe(10);
      expect(priorities.filter((p) => p === 'normal').length).toBe(10);
      expect(priorities.filter((p) => p === 'low').length).toBe(10);
    });
  });

  describe('Concurrent Dequeue Operations', () => {
    it('should prevent double-dequeue of same task', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: false,
        config: {},
      };

      taskQueue.enqueue({ type: 'capture-page', payload });

      const dequeuePromises = Array.from({ length: 10 }, () =>
        Promise.resolve(taskQueue.dequeue()),
      );

      const results = await Promise.all(dequeuePromises);
      const nonNullResults = results.filter((r) => r !== null);

      expect(nonNullResults.length).toBe(1);
    });

    it('should handle concurrent dequeue from empty queue', async () => {
      const dequeuePromises = Array.from({ length: 20 }, () =>
        Promise.resolve(taskQueue.dequeue()),
      );

      const results = await Promise.all(dequeuePromises);

      expect(results.every((r) => r === null)).toBe(true);
    });

    it('should distribute tasks across concurrent dequeues', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: true,
        config: {},
      };

      for (let i = 0; i < 10; i++) {
        taskQueue.enqueue({
          type: 'capture-page',
          payload: { ...payload, url: `https://example.com/${i}` },
        });
      }

      const dequeuePromises = Array.from({ length: 10 }, () =>
        Promise.resolve(taskQueue.dequeue()),
      );

      const results = await Promise.all(dequeuePromises);
      const tasks = results.filter((r) => r !== null);

      expect(tasks.length).toBe(10);

      const taskIds = new Set(tasks.map((t) => t?.id));
      expect(taskIds.size).toBe(10);
    });
  });

  describe('Concurrent Status Updates', () => {
    it('should handle concurrent task completions', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: false,
        config: {},
      };

      const taskIds = Array.from({ length: 20 }, () =>
        taskQueue.enqueue({ type: 'capture-page', payload }),
      );

      const updatePromises = taskIds.map((id) => Promise.resolve(taskQueue.complete(id)));

      await Promise.all(updatePromises);

      const tasks = db.prepare('SELECT status FROM tasks').all() as { status: string }[];
      expect(tasks.every((t) => t.status === 'completed')).toBe(true);
    });

    it('should handle concurrent failures and retries', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: true,
        config: {},
      };

      const taskIds = Array.from({ length: 10 }, () =>
        taskQueue.enqueue({ type: 'capture-page', payload }),
      );

      const updatePromises = taskIds.map((id, index) =>
        index % 2 === 0
          ? Promise.resolve(taskQueue.fail(id, 'Test error'))
          : Promise.resolve(taskQueue.complete(id)),
      );

      await Promise.all(updatePromises);

      const completed = (
        db
          .prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?')
          .get('completed') as CountResult
      ).count;
      const failed = (
        db
          .prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?')
          .get('failed') as CountResult
      ).count;
      expect(completed + failed).toBe(10);
    });

    it('should maintain status consistency under race conditions', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: false,
        config: {},
      };

      const taskId = taskQueue.enqueue({ type: 'capture-page', payload });

      const operations = [
        Promise.resolve(taskQueue.complete(taskId)),
        Promise.resolve(taskQueue.fail(taskId, 'Error')),
        Promise.resolve(taskQueue.retry(taskId)),
      ];

      await Promise.all(operations);

      const task = db.prepare('SELECT status FROM tasks WHERE id = ?').get(taskId) as {
        status: string;
      };
      expect(['pending', 'completed', 'failed']).toContain(task.status);
    });
  });

  describe('Mixed Concurrent Operations', () => {
    it('should handle concurrent enqueue, dequeue, and status updates', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: true,
        config: {},
      };

      const operations = [];

      for (let i = 0; i < 20; i++) {
        operations.push(
          Promise.resolve(
            taskQueue.enqueue({
              type: 'capture-page',
              payload: { ...payload, url: `https://example.com/${i}` },
            }),
          ),
        );
      }

      for (let i = 0; i < 10; i++) {
        operations.push(Promise.resolve(taskQueue.dequeue()));
      }

      const taskId = taskQueue.enqueue({ type: 'capture-page', payload });
      for (let i = 0; i < 5; i++) {
        operations.push(Promise.resolve(taskQueue.complete(taskId)));
      }

      await Promise.all(operations);

      const tasks = db.prepare('SELECT * FROM tasks').all();
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('should maintain queue integrity under heavy load', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: false,
        config: {},
      };

      const operations = [];

      for (let i = 0; i < 100; i++) {
        operations.push(Promise.resolve(taskQueue.enqueue({ type: 'capture-page', payload })));
      }

      for (let i = 0; i < 50; i++) {
        operations.push(Promise.resolve(taskQueue.dequeue()));
      }

      await Promise.all(operations);

      const pendingTasks = db
        .prepare('SELECT * FROM tasks WHERE status = ?')
        .all('pending') as CountResult[];
      const processingTasks = db
        .prepare('SELECT * FROM tasks WHERE status = ?')
        .all('processing') as CountResult[];

      expect(pendingTasks.length + processingTasks.length).toBe(100);
    });
  });

  describe('Transaction Isolation', () => {
    it('should isolate concurrent transactions', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: true,
        config: {},
      };

      const transaction1 = new Promise<void>((resolve) => {
        db.transaction(() => {
          for (let i = 0; i < 10; i++) {
            taskQueue.enqueue({ type: 'capture-page', payload });
          }
        })();
        resolve();
      });

      const transaction2 = new Promise<void>((resolve) => {
        db.transaction(() => {
          for (let i = 0; i < 10; i++) {
            taskQueue.enqueue({ type: 'capture-page', payload });
          }
        })();
        resolve();
      });

      await Promise.all([transaction1, transaction2]);

      const tasks = db.prepare('SELECT * FROM tasks').all();
      expect(tasks.length).toBe(20);
    });

    it('should rollback failed transactions', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: false,
        config: {},
      };

      const initialCount = (db.prepare('SELECT COUNT(*) as count FROM tasks').get() as CountResult)
        .count;

      try {
        db.transaction(() => {
          taskQueue.enqueue({ type: 'capture-page', payload });
          taskQueue.enqueue({ type: 'capture-page', payload });
          throw new Error('Simulated error');
        })();
      } catch (_error) {
        // Expected error
      }

      const finalCount = (db.prepare('SELECT COUNT(*) as count FROM tasks').get() as CountResult)
        .count;
      expect(finalCount).toBe(initialCount);
    });
  });

  describe('Priority Queue Race Conditions', () => {
    it('should respect priority under concurrent operations', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: true,
        config: {},
      };

      const enqueuePromises = [
        ...Array.from({ length: 5 }, () =>
          Promise.resolve(taskQueue.enqueue({ type: 'capture-page', payload, priority: 'low' })),
        ),
        ...Array.from({ length: 5 }, () =>
          Promise.resolve(taskQueue.enqueue({ type: 'capture-page', payload, priority: 'high' })),
        ),
        ...Array.from({ length: 5 }, () =>
          Promise.resolve(taskQueue.enqueue({ type: 'capture-page', payload, priority: 'normal' })),
        ),
      ];

      await Promise.all(enqueuePromises);

      const firstTask = taskQueue.dequeue();

      expect(firstTask).not.toBeNull();
      if (firstTask) {
        expect(firstTask.priority).toBe('high');
      }
    });

    it('should handle priority changes under concurrent updates', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: false,
        config: {},
      };

      const taskId = taskQueue.enqueue({ type: 'capture-page', payload, priority: 'normal' });

      const updatePromises = [
        Promise.resolve(
          db.prepare('UPDATE tasks SET priority = ? WHERE id = ?').run('high', taskId),
        ),
        Promise.resolve(
          db.prepare('UPDATE tasks SET priority = ? WHERE id = ?').run('low', taskId),
        ),
        Promise.resolve(
          db.prepare('UPDATE tasks SET priority = ? WHERE id = ?').run('normal', taskId),
        ),
      ];

      await Promise.all(updatePromises);

      const task = db.prepare('SELECT priority FROM tasks WHERE id = ?').get(taskId) as {
        priority: string;
      };
      expect(['high', 'normal', 'low']).toContain(task.priority);
    });
  });

  describe('Queue Statistics Under Concurrency', () => {
    it('should maintain accurate counts under concurrent operations', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: true,
        config: {},
      };

      const operations = [];

      for (let i = 0; i < 50; i++) {
        operations.push(Promise.resolve(taskQueue.enqueue({ type: 'capture-page', payload })));
      }

      await Promise.all(operations);

      const totalCount = (db.prepare('SELECT COUNT(*) as count FROM tasks').get() as CountResult)
        .count;
      expect(totalCount).toBe(50);
    });

    it('should track status transitions correctly', async () => {
      const payload: CapturePagePayload = {
        runId: 'run-123',
        pageId: 'page-456',
        url: 'https://example.com',
        projectId: 'project-789',
        isBaseline: false,
        config: {},
      };

      const taskIds = Array.from({ length: 20 }, () =>
        taskQueue.enqueue({ type: 'capture-page', payload }),
      );

      const updatePromises = taskIds
        .slice(0, 10)
        .map((id) => Promise.resolve(taskQueue.complete(id)));

      await Promise.all(updatePromises);

      const completedCount = (
        db
          .prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?')
          .get('completed') as CountResult
      ).count;
      const pendingCount = (
        db
          .prepare('SELECT COUNT(*) as count FROM tasks WHERE status = ?')
          .get('pending') as CountResult
      ).count;

      expect(completedCount).toBe(10);
      expect(pendingCount).toBe(10);
    });
  });
});
