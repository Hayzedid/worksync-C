export type CanonicalStatus = 'active' | 'pending' | 'completed' | 'archived' | '';

const mapping: Record<string, CanonicalStatus> = {
  // active variants
  active: 'active',
  act: 'active',
  in_progress: 'active',
  inprogress: 'active',
  'in progress': 'active',
  ongoing: 'active',
  started: 'active',

  // pending / todo variants
  pending: 'pending',
  todo: 'pending',
  to_do: 'pending',
  planned: 'pending',
  backlog: 'pending',

  // completed variants
  completed: 'completed',
  done: 'completed',
  finished: 'completed',
  closed: 'completed',

  // archived
  archived: 'archived',
  archive: 'archived',
  removed: 'archived',
  deleted: 'archived',
};

export function normalizeStatus(raw?: unknown): CanonicalStatus {
  if (!raw && raw !== '') return '';
  const s = String(raw).trim().toLowerCase();
  if (!s) return '';
  return mapping[s] ?? '';
}

export function statusToRank(s: CanonicalStatus) {
  switch (s) {
    case 'active':
      return 0;
    case 'pending':
      return 1;
    case 'completed':
      return 2;
    case 'archived':
      return 3;
    default:
      return 1;
  }
}
