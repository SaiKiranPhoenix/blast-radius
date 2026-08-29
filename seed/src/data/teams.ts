import type { TeamData } from './types';

export const teamsData: TeamData[] = [
  {
    id: 'team-platform',
    name: 'Platform Engineering',
    slack_channel: '#platform-oncall',
    oncall_email: 'platform-oncall@acme.com',
    timezone: 'America/New_York',
  },
  {
    id: 'team-identity',
    name: 'Identity & Access',
    slack_channel: '#identity-oncall',
    oncall_email: 'identity-oncall@acme.com',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'team-commerce',
    name: 'Commerce',
    slack_channel: '#commerce-oncall',
    oncall_email: 'commerce-oncall@acme.com',
    timezone: 'America/Chicago',
  },
  {
    id: 'team-payments',
    name: 'Payments',
    slack_channel: '#payments-oncall',
    oncall_email: 'payments-oncall@acme.com',
    timezone: 'America/New_York',
  },
  {
    id: 'team-notifications',
    name: 'Notifications',
    slack_channel: '#notifications-oncall',
    oncall_email: 'notifications-oncall@acme.com',
    timezone: 'Europe/London',
  },
  {
    id: 'team-search',
    name: 'Search & Discovery',
    slack_channel: '#search-oncall',
    oncall_email: 'search-oncall@acme.com',
    timezone: 'America/Denver',
  },
  {
    id: 'team-inventory',
    name: 'Inventory & Fulfillment',
    slack_channel: '#inventory-oncall',
    oncall_email: 'inventory-oncall@acme.com',
    timezone: 'America/Chicago',
  },
  {
    id: 'team-data',
    name: 'Data & Analytics',
    slack_channel: '#data-oncall',
    oncall_email: 'data-oncall@acme.com',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'team-user',
    name: 'User Experience',
    slack_channel: '#user-oncall',
    oncall_email: 'user-oncall@acme.com',
    timezone: 'America/New_York',
  },
  {
    id: 'team-ml',
    name: 'Machine Learning',
    slack_channel: '#ml-oncall',
    oncall_email: 'ml-oncall@acme.com',
    timezone: 'America/Los_Angeles',
  },
];

// Generate 40 additional teams (some empty/without services to test edge cases)
for (let i = 1; i <= 40; i++) {
  teamsData.push({
    id: `team-gen-${i}`,
    name: `Generated Team Alpha-${i}`,
    slack_channel: `#gen-oncall-${i}`,
    oncall_email: `gen-team-${i}@acme.com`,
    timezone: i % 2 === 0 ? 'America/New_York' : 'Europe/London',
  });
}
