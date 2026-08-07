<img src="charming-icon.png" alt="Charming" width="80" />

# Charming MCP Server

Charming is a hosted MCP server that generates, hosts, and updates interactive web apps. Connect it to any MCP-compatible AI client and ask it to build an app. You get back a live URL in seconds.

## Connect

<!-- generated:connect-table -->
| Client | Endpoint |
|--------|----------|
| Claude, Claude Code, Cursor, Codex, Gemini CLI, and most MCP clients | `https://charm.ing/mcp` |
| ChatGPT | `https://charm.ing/mcp/chatgpt` (one-click via the Charming listing in the ChatGPT Apps directory; this paste-string is the Developer Mode fallback) |
<!-- /generated:connect-table -->

Most MCP clients can use this remote configuration:

```json
{
  "mcpServers": {
    "charming": {
      "url": "https://charm.ing/mcp",
      "type": "streamableHttp"
    }
  }
}
```

The MCP endpoints require a bearer token, and OAuth with Dynamic Client Registration bootstraps one automatically: clients that support it show a one-time consent screen, with no API key to paste. Anonymous creation with no token is available on the HTTP path only. Auth guide: [usecharming.com/auth.md](https://usecharming.com/auth.md).

For per-client paste-strings and setup steps, see [usecharming.com/clients.txt](https://usecharming.com/clients.txt).

## Starter Prompt

Once Charming is connected, paste this to start a build session:

```
Help me figure out what to build. Look at what you know about me and suggest 2-3 apps that fit, or ask me up to 3 short questions to find an idea.

Read https://usecharming.com/start.md then help me create my first app.
```

## Tools

<!-- generated:tools-table -->
Charming exposes 24 tools. Connected clients discover them automatically via `tools/list`.

| Tool | What it does |
|------|-------------|
| `create_app` | Store an agent-authored module (a `manifest` plus `routes`) with optional UI and CSS, and render it inline. Requires a `description`. Give the user the returned token-free `shareUrl`, never the machine-only `url`. |
| `update_app` | Edit an existing app by replacing its module/UI/styles/description or applying exact-string edits, with optimistic-concurrency versioning. |
| `get_app` | Render an existing app inline (where the client supports it) and return its callable API operations and metadata. |
| `get_app_source` | Return the persisted module, UI, and styles for an existing app plus its current version. |
| `list_apps` | List the caller's apps plus apps shared with them, newest first, with each app's role, description, and capabilities. |
| `delete_app` | Permanently delete an app you own. Irreversible and confirmation-gated: it fails closed until re-invoked with `confirm: true`. Pass `purge_storage: true` to also wipe stored state. |
| `upload_asset` | Store a static asset (image, PDF, dataset) so app code stays small; readable back same-origin. |
| `rename_app` | Change an app's URL slug. The old URL keeps working by redirecting. |
| `set_remixable` | Mark an app remixable so visitors get their own editable copy. |
| `unset_remixable` | Stop allowing remixes; existing remixes survive untouched. |
| `set_starter_prompt` | Set or clear the prompt prefilled in the chat host when a visitor opens a shared app. |
| `query_app` | Run a read-only backend operation inside an app module. |
| `mutate_app` | Run a mutating backend operation inside an app module without editing code. |
| `submit_feedback` | Record agent-authored feedback (bugs, enhancements, crash reports) about an app. |
| `list_feedback` | List feedback rows for the caller's apps, newest first. |
| `set_handle` | Change the signed-in user's handle (the first segment of their app URLs). |
| `share_app` | Invite someone to an app as `collaborator` (default), `end-user` (run and write data, cannot edit source), or `viewer` (read-only). Calling it again with a role changes their role in place. |
| `unshare_app` | Revoke access for any grantee, whether the invitation is still pending or already accepted. |
| `list_app_shares` | List active and pending share invites for one of your apps. |
| `set_public` | Make an app public: anyone with the URL can open it with no login and read AND write its shared data. Warn the user that every anonymous visitor shares one data pool, so anyone with the URL can overwrite or wipe it. |
| `unset_public` | Make a public app private again; anonymous visitors can no longer open it. |
| `set_template` | Publish an app as a template so anyone opening its URL gets their own brand-new copy, leaving the original untouched. Pass `listed: true` to also list it in the public directory. Omitting `listed` leaves the current listing state alone. The app must be claimed first. |
| `unset_template` | Stop treating an app as a template: new visitors can no longer copy it, and any public listing is cleared. Existing copies survive. |
| `search_templates` | Search the public Charming template directory by keyword. Check here for an existing template before calling `create_app`, or when the user asks what templates exist. Each hit carries a `copyUrl` a visitor can open to mint their own independent copy with no login. |
<!-- /generated:tools-table -->

## Use with a coding agent

Working in Codex, Claude Code, Cursor, or another AI coding agent? Install the optional Charming authoring skill from [skills.sh](https://www.skills.sh) with `npx skills add tambo-labs/charming-mcp`. This installs authoring guidance; it does not connect the MCP server.

It teaches the agent Charming's build contract and workflow. The skill itself is [`SKILL.md`](./SKILL.md); [`AGENTS.md`](./AGENTS.md) has connect and authoring instructions for any AI coding agent. Codex users can instead install the bundled [Charming Codex plugin](https://github.com/tambo-labs/charming-codex-plugin).

### Cursor

Cursor reads project rules from `.cursor/rules/`. Drop [`.cursor/rules/charming.mdc`](./.cursor/rules/charming.mdc) into your project (or copy its body into a legacy root `.cursorrules`) and Cursor's agent will reach for Charming (real URL, storage, and inline rendering) whenever you ask for an app you want to keep. The rule points at the served docs; it does not duplicate the contract.

## Distribution

This repository is the canonical source for every public Charming integration package. Platform-neutral artifacts are hand-edited; platform adapters are generated from them, so a fact lives in exactly one file.

| Kind | Artifact |
|------|----------|
| Platform-neutral (edit these) | [`canonical/facts.json`](./canonical/facts.json), [`SKILL.md`](./SKILL.md), [`AGENTS.md`](./AGENTS.md), [`.cursor/rules/charming.mdc`](./.cursor/rules/charming.mdc), [`charming-icon.png`](./charming-icon.png) |
| Adapter (generated) | `plugins/cursor/charming`, `plugins/claude-code/charming`, `plugins/codex/charming`, `plugins/agent-plugins/charming` (a portable [Agent Plugins](https://agent-plugins.org/) v1.0.0 package), `gemini-extension.json`, `GEMINI.md`, the three marketplace catalogs |

```bash
node scripts/build-packages.mjs          # regenerate every adapter
node scripts/build-packages.mjs --check  # fail on drift (runs in CI)
```

The adapters are not published yet; publishing each one is tracked separately. See [`DISTRIBUTION.md`](./DISTRIBUTION.md) for the layout, the drift checks, and how the Charming monorepo proposes changes here.

## Documentation

- Agent skill: [`SKILL.md`](./SKILL.md) · coding-agent guide: [`AGENTS.md`](./AGENTS.md) · Cursor rule: [`.cursor/rules/charming.mdc`](./.cursor/rules/charming.mdc)
- Full authoring guide: [usecharming.com/llms-full.txt](https://usecharming.com/llms-full.txt)
- Auth and pairing: [usecharming.com/auth.md](https://usecharming.com/auth.md) · limits: [usecharming.com/pricing.md](https://usecharming.com/pricing.md)
- OpenAPI spec: [charm.ing/.well-known/openapi.json](https://charm.ing/.well-known/openapi.json)
- Docs: [usecharming.com/docs](https://usecharming.com/docs)

## Publisher

Published by [Tambo](https://tambo.co).
