const YarnOutdatedNotifier = require('../YarnOutdatedNotifier');

const factory = options => (
  new YarnOutdatedNotifier({
    ...options,
    apiToken: 'test-token',
  })
);

describe('YarnOutdatedNotifier', () => {
  test('Should be throw error', () => {
    expect(() => {
      new YarnOutdatedNotifier(); // eslint-disable-line no-new
    }).toThrow();
  });

  test('Should be create instance', () => {
    expect(() => {
      factory();
    }).not.toThrow();
  });

  test('Should be labels is empty array by default', () => {
    const notifier = factory();
    expect(notifier.options.assignees).toEqual([]);
  });

  test('Should be labels is array contains specified data', () => {
    const notifier = factory({
      labels: 'bug,help-wanted',
    });
    expect(notifier.options.labels).toEqual(['bug', 'help-wanted']);
  });

  test('Should be assignees is empty array by default', () => {
    const notifier = factory();
    expect(notifier.options.assignees).toEqual([]);
  });

  test('Should be assignees is array contains specified data', () => {
    const notifier = factory({
      assignees: 'cats-oss,januswel',
    });
    expect(notifier.options.assignees).toEqual(['cats-oss', 'januswel']);
  });

  // TODO: More tests ...
});
