import { ArticlesOrdering } from '@/entities/article';

const STORAGE_KEY = 'mock_sort_type';
const DEFAULT_ORDERING: ArticlesOrdering = '-published_at';
const VALID_ORDERINGS: readonly ArticlesOrdering[] = ['published_at', '-published_at'];

export function loadOrdering(): ArticlesOrdering {
  const stored = localStorage.getItem(STORAGE_KEY);
  return VALID_ORDERINGS.find((ordering) => ordering === stored) ?? DEFAULT_ORDERING;
}

export function saveOrdering(ordering: ArticlesOrdering): void {
  localStorage.setItem(STORAGE_KEY, ordering);
}
