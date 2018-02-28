const url = require('url');
const { execSync } = require('child_process');
const parseGitUrl = require('github-url-from-git');

exports.canExecYarn = () => {
  try {
    const res = execSync('which yarn', { encoding: 'utf8' });
    return res.trim() !== '';
  } catch (e) {
    return false;
  }
};

exports.formatDate = (date) => {
  const pad = s => s.padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(`${date.getMonth() + 1}`);
  const day = pad(`${date.getDate()}`);
  return `${year}-${month}-${day}`;
};

exports.getRepositoryInfo = () => {
  const info = {
    owner: '',
    repository: '',
  };

  try {
    const gitUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).toString().trim();
    const { pathname } = url.parse(parseGitUrl(gitUrl));
    const [owner, repository] = pathname.replace(/^\/|\/$/, '').split('/');
    info.owner = owner;
    info.repository = repository;
  } catch (e) {} // eslint-disable-line no-empty

  return info;
};

exports.normalizePackages = packages => (
  packages.map((pkg) => {
    const hasWorkspace = pkg.length >= 8;

    return {
      name: pkg[0],
      current: pkg[1],
      wanted: pkg[2],
      latest: pkg[3],
      workspace: hasWorkspace ? pkg[4] : '',
      type: hasWorkspace ? pkg[5] : pkg[4],
      url: hasWorkspace ? pkg[6] : pkg[5],
      changelog: hasWorkspace ? pkg[7] : pkg[6],
    };
  })
);

exports.packageTable = (packages) => {
  if (packages.length === 0) {
    return '';
  }

  const hasWorkspace = !!packages[0].workspace;

  const result = [];

  const headers = [
    'Package',
    'Current',
    'Wanted',
    'Latest',
    ...(hasWorkspace ? ['Workspace'] : []),
    'Type',
    'CHANGELOG',
  ];

  result.push(`| ${headers.join(' | ')} |`);
  result.push(`|${(new Array(headers.length)).fill(':----').join('|')}|`);

  packages.forEach((pkg) => {
    const arr = [
      `[${pkg.name}](${pkg.url})`,
      `\`${pkg.current}\``,
      `\`${pkg.wanted}\``,
      `\`${pkg.latest}\``,
      ...(hasWorkspace ? [`\`${pkg.workspace}\``] : []),
      `\`${pkg.type}\``,
      pkg.changelog || '-',
    ];

    result.push(`| ${arr.join(' | ')} |`);
  });

  return result.join('\n');
};
