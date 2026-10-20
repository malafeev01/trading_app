import { loadOrdering, saveOrdering } from './ordering-storage';

const STORAGE_KEY = 'mock_sort_type';

describe('ordering storage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('defaults to newest first', () => {
    expect(loadOrdering()).toBe('-published_at');
  });

  it('restores a saved ordering', () => {
    saveOrdering('published_at');

    expect(loadOrdering()).toBe('published_at');
  });

  it('ignores an invalid stored value', () => {
    localStorage.setItem(STORAGE_KEY, 'drop table');

    expect(loadOrdering()).toBe('-published_at');
  });
});
