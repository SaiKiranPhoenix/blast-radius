export interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  defaultSeverity: 'SEV1' | 'SEV2' | 'SEV3';
  createdAt: string;
}

export const workspacesData: WorkspaceData[] = [
  {
    id: 'ws-acme',
    name: 'Acme Corp Demo',
    slug: 'acme',
    defaultSeverity: 'SEV2',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];
