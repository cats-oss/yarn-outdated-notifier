const {
  formatDate,
  getRepositoryInfo,
  normalizePackages,
  packageTable,
} = require('../utils');

describe('Utilities', () => {
  test('formatDate()', () => {
    expect(formatDate(new Date(2018, 0, 1))).toEqual('2018-01-01');
    expect(formatDate(new Date(2020, 11, 22))).toEqual('2020-12-22');
  });

  test('getRepositoryInfo()', () => {
    expect(getRepositoryInfo()).toEqual({
      owner: 'cats-oss',
      repository: 'yarn-outdated-notifier',
    });
  });

  test('normalizePackages()', () => {
    expect(normalizePackages([
      [
        'name',
        '0.0.0',
        '0.0.1',
        '0.0.2',
        'type',
        'url',
        'changelog',
      ],
    ])).toEqual([
      {
        name: 'name',
        current: '0.0.0',
        wanted: '0.0.1',
        latest: '0.0.2',
        workspace: '',
        type: 'type',
        url: 'url',
        changelog: 'changelog',
      },
    ]);

    expect(normalizePackages([
      [
        'name',
        '0.0.0',
        '0.0.1',
        '0.0.2',
        'workspace',
        'type',
        'url',
        'changelog',
      ],
    ])).toEqual([
      {
        name: 'name',
        current: '0.0.0',
        wanted: '0.0.1',
        latest: '0.0.2',
        workspace: 'workspace',
        type: 'type',
        url: 'url',
        changelog: 'changelog',
      },
    ]);
  });

  test('packageTable', () => {
    expect(packageTable([
      {
        name: 'name1',
        current: '0.0.0',
        wanted: '0.0.1',
        latest: '0.0.2',
        workspace: '',
        type: 'type1',
        url: 'url1',
        changelog: 'changelog1',
      },
      {
        name: 'name2',
        current: '1.0.0',
        wanted: '1.0.1',
        latest: '1.0.2',
        workspace: '',
        type: 'type2',
        url: 'url2',
        changelog: 'changelog2',
      },
    ])).toEqual(`| Package | Current | Wanted | Latest | Type | CHANGELOG |
|:----|:----|:----|:----|:----|:----|
| [name1](url1) | \`0.0.0\` | \`0.0.1\` | \`0.0.2\` | \`type1\` | changelog1 |
| [name2](url2) | \`1.0.0\` | \`1.0.1\` | \`1.0.2\` | \`type2\` | changelog2 |`);

    expect(packageTable([
      {
        name: 'name1',
        current: '0.0.0',
        wanted: '0.0.1',
        latest: '0.0.2',
        workspace: 'workspace1',
        type: 'type1',
        url: 'url1',
        changelog: 'changelog1',
      },
      {
        name: 'name2',
        current: '1.0.0',
        wanted: '1.0.1',
        latest: '1.0.2',
        workspace: 'workspace2',
        type: 'type2',
        url: 'url2',
        changelog: 'changelog2',
      },
    ])).toEqual(`| Package | Current | Wanted | Latest | Workspace | Type | CHANGELOG |
|:----|:----|:----|:----|:----|:----|:----|
| [name1](url1) | \`0.0.0\` | \`0.0.1\` | \`0.0.2\` | \`workspace1\` | \`type1\` | changelog1 |
| [name2](url2) | \`1.0.0\` | \`1.0.1\` | \`1.0.2\` | \`workspace2\` | \`type2\` | changelog2 |`);
  });
});
