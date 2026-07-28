# Distribution

This repository is the canonical public source for Charming integration packages. Every platform adapter is generated from the same facts, and CI fails when a packaged copy drifts.

## Layout

```text
canonical/
  facts.json               endpoints, metadata, assets, tool list, marketplace identity
  version-lock.json        the version the current canonical content was released at (generated)
  platform-notes/          per-platform additions appended to the generated skill
  assets/                  shared art that is not already at the repo root
SKILL.md                   canonical agent skill (also what `npx skills add` installs)
AGENTS.md                  canonical coding-agent guide
.cursor/rules/charming.mdc canonical Cursor rule
charming-icon.png          canonical icon
scripts/build-packages.mjs generator and drift checker
scripts/verify-checker.mjs proves the drift checker fails on each drift class
.gitattributes             marks generated paths, which JSON cannot say for itself
plugins/<platform>/charming self-contained adapter package (generated)
gemini-extension.json      Gemini CLI manifest, required at the absolute repo root (generated)
GEMINI.md                  Gemini context file (generated)
.cursor-plugin/marketplace.json   Cursor catalog (generated)
.claude-plugin/marketplace.json   Claude Code catalog (generated)
.agents/plugins/marketplace.json  Codex catalog (generated)
```

Hand-edit only the canonical files and this document. Everything else is written by the generator and committed, because the hosts clone this repository rather than build it and must find finished packages.

`README.md` is the one hybrid: its prose is hand-edited, but the connect and tool tables between `<!-- generated:... -->` markers are written by the generator. Edit the prose freely; never edit inside the markers.

Generated markdown carries a do-not-edit banner. Generated JSON cannot hold a comment, so those paths are listed in `.gitattributes` as `linguist-generated` and named in each package's README instead.

## Commands

```bash
node scripts/build-packages.mjs           # write the adapters
node scripts/build-packages.mjs --check   # fail on drift
node scripts/build-packages.mjs --release # stamp the release marker at the current version
node scripts/verify-checker.mjs           # prove the drift checker still catches every class
```

Node 20.11 or newer (the generator uses `import.meta.dirname`). No dependencies, no install step. CI runs the last two.

## What the check enforces

- **Generated parity.** Every adapter file is regenerated in memory and compared byte for byte, so editing a packaged copy fails instead of silently diverging.
- **Nothing extra.** Each package must contain exactly its generated files, so a hand-added file or an orphaned package directory fails rather than shipping unnoticed. Byte parity alone would only cover files the generator already knows about.
- **Canonical inputs are validated first.** `canonical/facts.json` must parse, carry every required key with the right type, and resolve every client to a real endpoint, so a typo stops the run instead of reaching a template as `undefined`. Unterminated YAML frontmatter in a canonical markdown file also stops the run rather than splicing the banner inside the frontmatter.
- **Endpoints and assets stay ours.** Every endpoint must be https on a host in `facts.ownedHosts`, every other URL on a host in `facts.externalHosts`, and every asset path must resolve inside the repository. Every `charm.ing` and `usecharming.com` URL anywhere in the repository must also be declared in `canonical/facts.json`.
- **No symlinks.** A symlink anywhere in the tree fails, because a host that copies one package directory would get a dangling link.
- **Content cannot move without a version bump.** Claude Code, Cursor, and Codex each pin an installed plugin to its version string, so regenerated content reaches nobody until that string changes. `canonical/version-lock.json` records the last RELEASED version and the content that shipped with it. Changing a canonical input while `version` still equals the released one fails. Bumping once covers a whole release: edits keep passing while the version differs from the released one, and `--release` stamps the marker when the packages actually go out.
- **Tool list.** Any "N tools" claim must match the length of `facts.tools`, including qualified phrasings such as "N MCP tools". Any snake_case identifier inside a markdown code span or fenced block must be a real tool name or an explicit allowlist entry.
- **Branding.** No stale `buildy` branding anywhere. The runtime global that generated apps call is `window.charming`; `window.buildy` is a stale name and the check now rejects it. This file is exempt because it documents the rule, and `scripts/verify-checker.mjs` is exempt because it holds deliberate drift fixtures.
- **Assets and self-containment.** Manifest paths (`logo`, `skills`, `mcpServers`, `composerIcon`) must resolve inside the package and contain no `..` segments, so a host that copies one subdirectory gets a working plugin.
- **Manifests.** Marketplace and plugin names are kebab-case, sources start with `./`, and every source directory holds its platform's plugin manifest.

## Per-platform shape

| Platform | Host requirement met here |
|----------|---------------------------|
| Cursor | `.cursor-plugin/plugin.json` per plugin, `mcp.json` for MCP servers, `rules/` and `skills/` discovered by convention, catalog at `.cursor-plugin/marketplace.json` |
| Claude Code | `.claude-plugin/plugin.json`, `.mcp.json` with `"type": "http"` (a `url` with no `type` is read as stdio and skipped), catalog at `.claude-plugin/marketplace.json` |
| Codex | `.codex-plugin/plugin.json` with the `interface` block the marketplace renders, `.mcp.json`, catalog at `.agents/plugins/marketplace.json` |
| Gemini CLI | `gemini-extension.json` at the absolute repository root, remote MCP declared as `httpUrl`, context in `GEMINI.md` |
| OpenAI plugins directory | Submitted through the portal with the production MCP URL; the skill bundle comes from `SKILL.md`. No repository layout requirement. |

Claude and other chat clients connect to the hosted endpoint directly and need no package.

## Changing a shared fact

1. Edit the canonical file: `canonical/facts.json` for metadata and URLs, `SKILL.md`, `AGENTS.md`, or `.cursor/rules/charming.mdc` for prose.
2. Run `node scripts/build-packages.mjs`.
3. Bump `version` in `canonical/facts.json` once per release. Without it, installed plugins never see the change.
4. Commit the canonical edit, the bumped version, and the regenerated adapters together.
5. When the packages are actually published, run `node scripts/build-packages.mjs --release` and commit the refreshed `canonical/version-lock.json`.

Platform-specific wording goes in `canonical/platform-notes/<platform>.md`, which the generator appends to that platform's skill. `{{mcpEndpoint}}` in a note expands to the canonical MCP endpoint.

## How the Charming monorepo proposes changes here

The private monorepo (`tambo-ai/charming`) owns product behavior; this repository owns public packaging. Nothing mirrors automatically, in either direction.

- A behavior change that moves a public fact (endpoint, tool set, tool description, docs URL) lands in the monorepo first, then arrives here as an ordinary pull request that edits `canonical/` and reruns the generator.
- `canonical/facts.json` is one more pinned copy of the MCP tool set, in a repository the monorepo's CI cannot see. A monorepo change that adds or removes a tool must update this repository too; nothing here can detect that on its own.
- The served docs (`usecharming.com/llms-full.txt` and friends) stay the deeper source for authoring detail. Canonical prose here points at those URLs instead of restating them, so a docs change needs no package release.
- This repository never receives private source, credentials, reviewer accounts, or unreleased product facts. Everything here is public by construction.
- Marketplace URLs and fresh-install smoke-test results are recorded here, so they survive independently of any monorepo issue.

## Publishing

Generating a package does not publish it. Each platform has its own listing, review, and smoke-test steps, tracked as separate issues. Existing installs of the older Codex marketplace at `github.com/tambo-labs/charming-codex-plugin` keep working until a migration is verified.
