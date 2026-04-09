import React from 'react';
import TopPostsWidget from './TopPostsWidget';
import { PostSnapshotRow } from '../../../types/relatorio';

interface Props {
  snapshot: PostSnapshotRow[];
}

export default function LowPerformanceWidget({ snapshot }: Props) {
  return <TopPostsWidget snapshot={snapshot} titulo="Posts com menor desempenho no período" />;
}
