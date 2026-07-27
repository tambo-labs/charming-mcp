#!/usr/bin/env node
// Proves `build-packages.mjs --check` fails on drift, not just that it passes clean.
//
//   node scripts/verify-checker.mjs
//
// Each case copies the repository to a scratch directory, injects one class of
// drift, and asserts the checker exits non-zero with the expected message. A
// check that silently stops detecting its class turns this red.

import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(import.meta.dirname, '..');

const readJson = (dir, rel) => JSON.parse(readFileSync(join(dir, rel), 'utf8'));
const writeJson = (dir, rel, value) => writeFileSync(join(dir, rel), `${JSON.stringify(value, null, 2)}\n`);
const append = (dir, rel, text) => writeFileSync(join(dir, rel), readFileSync(join(dir, rel), 'utf8') + text);

/** name, mutate(dir), expect: a substring the failure output must contain. */
const CASES = [
  {
    name: 'generated skill edited by hand',
    expect: 'is out of date',
    mutate: (dir) => append(dir, 'plugins/cursor/charming/skills/charming/SKILL.md', '\nedited\n'),
  },
  {
    name: 'generated file deleted',
    expect: 'is missing',
    mutate: (dir) => rmSync(join(dir, 'plugins/claude-code/charming/.mcp.json')),
  },
  {
    name: 'package asset replaced',
    expect: 'is out of date',
    mutate: (dir) => writeFileSync(join(dir, 'plugins/codex/charming/assets/icon.png'), 'not a png'),
  },
  {
    name: 'extra file added inside a package',
    expect: 'is not generated from canonical/',
    mutate: (dir) => writeFileSync(join(dir, 'plugins/cursor/charming/rules/extra.mdc'), '---\ndescription: x\n---\n'),
  },
  {
    name: 'unregistered package directory',
    expect: 'sits outside every known package',
    mutate: (dir) => cpSync(join(dir, 'plugins/cursor'), join(dir, 'plugins/windsurf'), { recursive: true }),
  },
  {
    name: 'symlink inside a package',
    expect: 'symlink',
    mutate: (dir) => {
      const link = join(dir, 'plugins/codex/charming/assets/icon.png');
      rmSync(link);
      symlinkSync(join(dir, 'charming-icon.png'), link);
    },
  },
  {
    name: 'endpoint repointed to an unowned host',
    expect: 'must be https on an owned host',
    mutate: (dir) => {
      const facts = readJson(dir, 'canonical/facts.json');
      facts.endpoints.mcp = 'https://charrn.ing/mcp';
      writeJson(dir, 'canonical/facts.json', facts);
    },
  },
  {
    name: 'asset path escaping the repository',
    expect: 'escapes the repository',
    mutate: (dir) => {
      const facts = readJson(dir, 'canonical/facts.json');
      facts.assets.icon = '../outside.png';
      writeJson(dir, 'canonical/facts.json', facts);
    },
  },
  {
    name: 'client pointing at an unknown endpoint key',
    expect: 'is not a key of endpoints',
    mutate: (dir) => {
      const facts = readJson(dir, 'canonical/facts.json');
      facts.clients[0].endpoint = 'nope';
      writeJson(dir, 'canonical/facts.json', facts);
    },
  },
  {
    name: 'required facts key removed',
    expect: 'must be a',
    mutate: (dir) => {
      const facts = readJson(dir, 'canonical/facts.json');
      delete facts.checks;
      writeJson(dir, 'canonical/facts.json', facts);
    },
  },
  {
    name: 'facts.json is not valid JSON',
    expect: 'not valid JSON',
    mutate: (dir) => writeFileSync(join(dir, 'canonical/facts.json'), '{ "product": '),
  },
  {
    name: 'canonical frontmatter left unterminated',
    expect: 'never closes it',
    mutate: (dir) => {
      const body = readFileSync(join(dir, 'SKILL.md'), 'utf8');
      writeFileSync(join(dir, 'SKILL.md'), body.replace('\n---\n', '\n'));
    },
  },
  {
    // Expects AGENTS.md specifically: it phrases the count as "N MCP tools", so a
    // count check that only matches a bare "N tools" leaves this file stale.
    name: 'tool added without updating a qualified count ("N MCP tools")',
    expect: 'AGENTS.md: says',
    mutate: (dir) => {
      const facts = readJson(dir, 'canonical/facts.json');
      facts.tools.push({ name: 'do_thing', summary: 'Does a thing.' });
      writeJson(dir, 'canonical/facts.json', facts);
    },
  },
  {
    name: 'stale branding in canonical prose',
    expect: 'stale branding',
    mutate: (dir) => append(dir, 'AGENTS.md', '\nBuildy hosts your app.\n'),
  },
  {
    name: 'undeclared owned-host URL in prose',
    expect: 'is not declared in canonical/facts.json',
    mutate: (dir) => append(dir, 'AGENTS.md', '\nSee https://usecharming.com/secret-page for more.\n'),
  },
  {
    name: 'unknown tool name in a fenced block',
    expect: 'is not a Charming tool',
    mutate: (dir) => append(dir, 'AGENTS.md', '\n```js\nawait frobnicate_app({ id })\n```\n'),
  },
  {
    name: 'README generated marker duplicated',
    expect: 'exactly one',
    mutate: (dir) => append(dir, 'README.md', '\n<!-- generated:tools-table -->\n<!-- /generated:tools-table -->\n'),
  },
  {
    name: 'README generated marker removed',
    expect: 'exactly one',
    mutate: (dir) => {
      const body = readFileSync(join(dir, 'README.md'), 'utf8');
      writeFileSync(join(dir, 'README.md'), body.replace('<!-- generated:connect-table -->\n', ''));
    },
  },
];

function scratch() {
  const dir = mkdtempSync(join(tmpdir(), 'charming-verify-'));
  cpSync(ROOT, dir, { recursive: true, filter: (src) => !src.includes(`${'/'}.git${'/'}`) && !src.endsWith('/.git') });
  return dir;
}

function check(dir) {
  const result = spawnSync(process.execPath, [join(dir, 'scripts/build-packages.mjs'), '--check'], {
    encoding: 'utf8',
  });
  return { code: result.status, output: `${result.stdout}${result.stderr}` };
}

let failures = 0;
const report = (ok, label, detail) => {
  console.log(`${ok ? 'pass' : 'FAIL'}  ${label}${detail ? `\n        ${detail}` : ''}`);
  if (!ok) failures += 1;
};

// The clean tree must pass, or every case below would "detect" drift vacuously.
{
  const dir = scratch();
  const { code, output } = check(dir);
  report(code === 0, 'clean tree passes', code === 0 ? '' : output.trim().split('\n').slice(0, 3).join(' | '));
  rmSync(dir, { recursive: true, force: true });
}

for (const testCase of CASES) {
  const dir = scratch();
  if (testCase.name === 'asset path escaping the repository') {
    writeFileSync(resolve(dir, '..', 'outside.png'), 'outside');
  }
  testCase.mutate(dir);
  const { code, output } = check(dir);
  const caught = code !== 0 && output.includes(testCase.expect);
  report(
    caught,
    testCase.name,
    caught ? '' : `exit ${code}, expected message containing "${testCase.expect}"; got: ${output.trim().slice(0, 200)}`,
  );
  rmSync(dir, { recursive: true, force: true });
  const stray = resolve(dir, '..', 'outside.png');
  if (existsSync(stray)) rmSync(stray, { force: true });
}

console.log(`\n${CASES.length + 1} checks, ${failures} failing`);
process.exit(failures === 0 ? 0 : 1);
