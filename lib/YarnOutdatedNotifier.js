const path = require('path');
const fs = require('fs');
const { exec, execSync, spawn } = require('child_process');
const chalk = require('chalk');
const emoji = require('node-emoji');
const humanizeDuration = require('humanize-duration');
const request = require('request');
const Handlebars = require('handlebars');
const {
  canExecYarn,
  formatDate,
  getRepositoryInfo,
  normalizePackages,
  packageTable,
} = require('./utils');

class YarnOutdatedNotifier {
  constructor(options) {
    this.options = {
      apiToken: '',
      title: '[{{date}}] Yarn Outdated Notifier',
      labels: '',
      assignees: '',
      excludes: '',
      changelogs: '',
      githubApiAddress: 'api.github.com',
      template: path.join(__dirname, 'template.hbs'),
      dryRun: false,
      ...getRepositoryInfo(),
      ...options,
    };

    this.options.labels = this.options.labels ? this.options.labels.split(',').map(s => s.trim()) : [];
    this.options.assignees = this.options.assignees ? this.options.assignees.split(',').map(s => s.trim()) : [];

    this.validate();
  }

  validate() {
    const {
      apiToken,
      owner,
      repository,
      excludes,
      changelogs,
      template,
      dryRun,
    } = this.options;

    const required = (value, msg) => {
      if (!value) {
        throw new Error(msg);
      }
    };

    const existsFile = (p) => {
      if (!p) {
        return;
      }

      if (!fs.existsSync(p)) {
        throw new Error(`"${p}" does not exist`);
      }
    };

    if (!canExecYarn()) {
      throw new Error('"yarn-outdated-notifier" requires "yarn" to be installed.');
    }

    if (!dryRun) {
      required(apiToken, 'API Token (--api-token) is required');
    }

    required(owner, 'Repository owner name (--owner) is required');
    required(repository, 'Repository name (--repository) is required');

    existsFile(excludes);
    existsFile(changelogs);
    existsFile(template);
  }

  async notify() {
    const { dryRun } = this.options;
    const start = Date.now();

    const json = await this.exec();

    if (!dryRun) {
      process.stdout.write(`${emoji.get('mag')}  Checking for outdated packages ...\n`);
    }

    if (!json) {
      process.stdout.write(`${chalk.green('All packages are Fresh!')}\n`);
      return;
    }

    const content = this.build(json);

    if (dryRun) {
      process.stdout.write(`${content}\n`);
    } else {
      process.stdout.write(`${emoji.get('hourglass')}  Submitting to GitHub issue ...\n`);

      const issue = await this.post(content);
      const time = humanizeDuration(Date.now() - start);

      process.stdout.write(`${emoji.get('rocket')}  ${chalk.green('success')} Submitted to "${chalk.bold(`${issue.title} #${issue.number}`)}"\n`);
      process.stdout.write(`   > ${chalk.cyan(issue.html_url)}\n\n`);
      process.stdout.write(`${emoji.get('sparkles')}  Done ${chalk.bold(time)}\n`);
    }
  }

  exec() {
    const { changelogs, excludes } = this.options;
    const encoding = 'utf8';

    return new Promise((resolve, reject) => {
      const bin = execSync('yarn bin', { encoding }).toString().trim();

      exec('yarn outdated --json', { encoding }, (error, stdout) => {
        if (!stdout) {
          resolve('');
          return;
        }

        const formatter = spawn(path.join(bin, 'format-yarn-outdated'), [
          '--format', 'json',
          ...(changelogs ? ['--changelogs', changelogs] : []),
          ...(excludes ? ['--excludes', excludes] : []),
        ]);

        let buf = '';

        formatter.stdout.on('data', (data) => {
          buf += data.toString();
        });

        formatter.stdout.on('end', () => {
          resolve(JSON.parse(buf));
        });

        formatter.on('error', (err) => {
          reject(err);
        });

        formatter.stdin.write(stdout);
        formatter.stdin.end();
      });
    });
  }

  build(json) {
    const { template: templatePath, changelogs, excludes } = this.options;
    const template = fs.readFileSync(templatePath, { encoding: 'utf8' });
    const tpl = Handlebars.compile(template);

    const outdated = {};
    let all = [];

    Object.keys(json).forEach((key) => {
      const packages = normalizePackages(json[key]);

      outdated[key] = {
        packages,
        table: packageTable(packages),
      };

      all = [...all, ...packages];
    });

    const markdown = tpl({
      meta: {
        owner: this.options.owner,
        repository: this.options.repository,
        githubApiAddress: this.options.githubApiAddress,
        changelogs: changelogs ? path.basename(changelogs) : '',
        excludes: excludes ? path.basename(excludes) : '',
        template: templatePath ? path.basename(templatePath) : '',
      },
      needsChangelog: all.filter(pkg => !pkg.changelog),
      outdated,
      all,
    });

    return markdown;
  }

  post(body) {
    const {
      apiToken,
      owner,
      repository,
      githubApiAddress,
      title: titleTemplate,
      labels,
      assignees,
    } = this.options;

    const titleTpl = Handlebars.compile(titleTemplate);
    const title = titleTpl({
      date: formatDate(new Date()),
      labels,
      assignees,
    });

    return new Promise((resolve, reject) => {
      const opts = {
        method: 'POST',
        url: `https://${githubApiAddress}/repos/${owner}/${repository}/issues`,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `${owner}/${repository}:yarn-outdated-notifier`,
          Authorization: `token ${apiToken}`,
        },
        json: true,
        body: {
          title,
          body,
          labels,
          assignees,
        },
      };

      request(opts, (err, res, resBody) => {
        if (err) {
          reject(err);
        } else if (res.statusCode < 200 || res.statusCode >= 300) {
          if (res.body && res.body.message) {
            reject(new Error(res.body.message));
          } else {
            reject(new Error('An unknown network error occurred'));
          }
        } else {
          resolve(resBody);
        }
      });
    });
  }
}

module.exports = YarnOutdatedNotifier;
