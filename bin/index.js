#!/usr/bin/env node

const meow = require('meow');
const chalk = require('chalk');
const YarnOutdatedNotifier = require('../lib/YarnOutdatedNotifier');

const Status = {
  OK: 0,
  ERROR: 1,
};

const cli = meow(`
${chalk.yellow('USAGE:')}
  $ outdated-notifier [options]

${chalk.yellow('OPTIONS:')}
  --api-token         API token for GitHub (required)
  --githubApiAddress, provide address for github enterprise (default: api.github.com)
  --owner,      -o    repository owner name (default: "git config --get remote.origin.url" infomation)
  --repository, -r    repository name (default: "git config --get remote.origin.url" infomation)
  --title,      -t    issue title for GitHub
  --labels,     -l    issue labels name for GitHub
  --assignees,  -a    issue assignees name for GitHub
  --excludes,   -e    path to yaml file which specify package names to exclude
  --changelogs, -c    path to yaml file which specify changelog uris for the packages
  --template          path to the template to use for notification
  --dry-run           do not register on issue, output contents to stdout
  --help,       -h    show help
  --version,    -v    print the version

${chalk.yellow('EXAMPLES:')}
  $ yarn outdated-notifier --api-token <your_personal_token>
  $ yarn outdated-notifier --api-token <your_personal_token> --labels "label_name" --assignees "assignee_name"
  $ yarn outdated-notifier --api-token <your_personal_token> --template "./template.hbs"
  $ yarn outdated-notifier --api-token <your_personal_token> --changelogs "./changelogs.yml"
  $ yarn outdated-notifier --api-token <your_personal_token> --changelogs "./changelogs.yml" --excludes "./excludes.yml"

`, {
  flags: {
    apiToken: {
      type: 'string',
    },
    owner: {
      type: 'string',
      alias: 'o',
    },
    repository: {
      type: 'string',
      alias: 'r',
    },
    title: {
      type: 'string',
      alias: 't',
    },
    labels: {
      type: 'string',
      alias: 'l',
    },
    assignees: {
      type: 'string',
      alias: 'a',
    },
    excludes: {
      type: 'string',
      alias: 'e',
    },
    changelogs: {
      type: 'string',
      alias: 'c',
    },
    template: {
      type: 'string',
    },
    dryRun: {
      type: 'boolean',
    },
    help: {
      alias: 'h',
    },
    version: {
      alias: 'v',
    },
  },
});

(async () => {
  try {
    const notifier = new YarnOutdatedNotifier(cli.flags, {
      workingDir: process.cwd(),
      stdout: process.stdout,
      stderr: process.stderr,
    });

    await notifier.notify();
    process.exit(Status.OK);
  } catch (e) {
    process.stdout.write(`${chalk.white.bgRed.bold(' ERROR ')} ${chalk.red(e.message)}\n`);
    process.exit(Status.ERROR);
  }
})();
