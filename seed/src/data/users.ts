export type UserRole = 'owner' | 'responder' | 'viewer';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
}

export const usersData: UserData[] = [
  {
    id: 'user-sre-lead',
    name: 'Alex Rivera',
    email: 'alex@demo.blastradius.app',
    role: 'owner',
    title: 'SRE Lead',
  },
  {
    id: 'user-oncall-eng',
    name: 'Sam Chen',
    email: 'sam@demo.blastradius.app',
    role: 'responder',
    title: 'On-Call Engineer',
  },
  {
    id: 'user-eng-manager',
    name: 'Jordan Lee',
    email: 'jordan@demo.blastradius.app',
    role: 'viewer',
    title: 'Engineering Manager',
  },
];
