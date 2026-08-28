/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'chore', // Maintenance task (no production code change)
        'docs', // Documentation only
        'style', // Formatting, missing semicolons, etc.
        'refactor', // Code change that is neither a fix nor a feature
        'test', // Adding or updating tests
        'perf', // Performance improvement
        'ci', // CI/CD changes
        'revert', // Revert a previous commit
        'build', // Build system or external dependencies
        'seed', // Database seed changes
      ],
    ],
    // Subject line max length
    'subject-max-length': [2, 'always', 100],
    // Subject must not end with a period
    'subject-full-stop': [2, 'never', '.'],
    // Body max line length
    'body-max-line-length': [2, 'always', 120],
  },
};
