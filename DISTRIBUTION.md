# Distribution

This repository is the canonical public source for Charming integration packages. Every platform adapter is generated from the same facts, and CI fails when a packaged copy drifts.

## Layout

```text
canonical/
  facts.json               endpoints, metadata, assets, tool list, marketplace identity
  platform-notes/          per-platform additions appended to the generated skill
  assets/                  shared art that is not already at the repo root
SKILL.md                   canonical agent skill (also what `npx skills add` installs)
AGENTS.md                  canonical coding-agent guide
.cursor/rules/charming.mdc canonical Cursor rule
charming-icon.png          canonical icon
scripts/build-packages.mjs generator and drift checker
plugins/<platform>/charming self-contained adapter package (generated)
gemini-extension.json      Gemini CLI manifest, required at the absolute repo root (generated)
GEMINI.md                  Gemini context file (generated)
.cursor-plugin/marketplace.json   Cursor catalog (generated)
.claude-plugin/marketplace.json   Claude Code catalog (generated)
.agents/plugins/marketplace.json  Codex catalog (generated)
```

Hand-edit only the canonical files. Everything else is written by the generator and committed, because the hosts clone this repository rather than build it and must find finished packages.

## Commands

```bash
node scripts/build-packages.mjs          # write the adapters
node scripts/build-packages.mjs --check  # fail on drift
```

Node 20 or newer. No dependencies, no install step.

## What the check enforces

- **Generated parity.** Every adapter file is regenerated in memory and compared byte for byte, so editing a packaged copy fails instead of silently diverging.
- **Endpoints.** Every `charm.ing` and `usecharming.com` URL anywhere in the repository must be declared in `canonical/facts.json`.
- **Tool list.** Any "N tools" claim must match the length of `facts.tools`, and any snake_case identifier inside a markdown code span must be a real tool name or an explicit allowlist entry.
- **Branding.** No stale `buildy` branding outside the runtime API name `window.buildy`, which is the real global that generated apps call. This file is exempt because it documents the rule.
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
3. Commit the canonical edit and the regenerated adapters together.

Platform-specific wording goes in `canonical/platform-notes/<platform>.md`, which the generator appends to that platform's skill. `{{mcpEndpoint}}` in a note expands to the canonical MCP endpoint.

## How the Charming monorepo proposes changes here

The private monorepo (`tambo-ai/charming`) owns product behavior; this repository owns public packaging. Nothing mirrors automatically, in either direction.

- A behavior change that moves a public fact — endpoint, tool set, tool description, docs URL — lands in the monorepo first, then arrives here as an ordinary pull request that edits `canonical/` and reruns the generator.
- The served docs (`usecharming.com/llms-full.txt` and friends) stay the deeper source for authoring detail. Canonical prose here points at those URLs instead of restating them, so a docs change needs no package release.
- This repository never receives private source, credentials, reviewer accounts, or unreleased product facts. Everything here is public by construction.
- Marketplace URLs and fresh-install smoke-test results are recorded here, so they survive independently of any monorepo issue.

## Publishing

Generating a package does not publish it. Each platform has its own listing, review, and smoke-test steps, tracked as separate issues. Existing installs of the older Codex marketplace at `github.com/tambo-labs/charming-codex-plugin` keep working until a migration is verified.
