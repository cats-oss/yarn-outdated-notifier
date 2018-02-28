const YarnOutdatedNotifier = require('../YarnOutdatedNotifier');

const factory = () => (
  new YarnOutdatedNotifier({
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

  // TODO: More tests ...
});
