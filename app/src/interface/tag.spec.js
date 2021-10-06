import { describe, expect, it } from '@jest/globals';
import { default as ITag } from './tag';

describe('testing ITag Interface', () => {
  it('should be instanced', () => {
    const tag = new ITag(1, 'Home');
    expect(tag).toBeDefined();
    expect(tag.id).toEqual(1);
    expect(tag.description).toEqual('Home');
  });

  it('should contain at least two proprerties', () => {
    expect(ITag.length).toBeGreaterThanOrEqual(2);
  });
});
