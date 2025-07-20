import { Issue } from '../components/IssuesTable';

const mockIssues: Issue[] = [
  {
    id: 'ISS-001',
    title: 'Privilege escalation vulnerability',
    severity: 'Critical',
    status: 'Open',
    owner: 'Security Team',
    updated: '2025-07-09',
  },
  {
    id: 'ISS-002',
    title: 'Outdated TLS protocol detected',
    severity: 'High',
    status: 'In Progress',
    owner: 'DevOps',
    updated: '2025-07-08',
  },
  {
    id: 'ISS-003',
    title: 'Weak password policy',
    severity: 'Medium',
    status: 'Open',
    owner: 'Security Team',
    updated: '2025-07-07',
  },
  {
    id: 'ISS-004',
    title: 'Missing HTTP security headers',
    severity: 'Low',
    status: 'Closed',
    owner: 'Backend Team',
    updated: '2025-07-06',
  },
];

export default mockIssues; 