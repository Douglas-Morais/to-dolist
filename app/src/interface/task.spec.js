/**
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals';
import { default as ITask } from './task';


describe('Testing ITask interface', () => {
  it('should be instanced', () => {
    const created = new Date();
    const deadline = new Date('2021-10-10');
    const task = new ITask(
      1,
      'shop at the supermarket',
      created,
      deadline,
      1,
      1,
    );

    expect(task).toBeDefined();
    expect(task.id).toEqual(1);
    expect(task.priorityKey).toEqual(1);
    expect(task.tagKey).toEqual(1);
  });

  it('should contain at least six properties', () => {
    expect(ITask.length).toBeGreaterThanOrEqual(6);
  });
});