import type { ReactElement } from 'react';
import { useSEO } from '@/react-app/hooks/useSEO';

/**
 * Wraps a route that should never appear in search results — admin tooling, internal
 * utilities, and per-customer pages like generated results and checkout.
 *
 * robots.txt already disallows these paths, but a Disallow only stops crawling, not
 * indexing: a disallowed URL that gets linked can still be indexed as a bare title.
 * The noindex tag is what actually keeps it out, so both are needed.
 */
export default function NoIndex({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}) {
  useSEO({ title, noindex: true });
  return children;
}
