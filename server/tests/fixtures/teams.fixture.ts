import type { TeamSummary, TeamSummaryWithCounts } from '../../src/types/team.types';

export const teamPlatform: TeamSummary = {
  id: 'team-platform',
  name: 'Platform Engineering',
  slack_channel: '#platform-oncall',
  oncall_email: 'platform-oncall@acme.com',
  timezone: 'America/New_York',
};

export const teamIdentity: TeamSummary = {
  id: 'team-identity',
  name: 'Identity & Access',
  slack_channel: '#identity-oncall',
  oncall_email: 'identity-oncall@acme.com',
  timezone: 'America/Los_Angeles',
};

export const teamPlatformWithCounts: TeamSummaryWithCounts = {
  ...teamPlatform,
  serviceCount: 2,
  activeIncidentCount: 1,
};
