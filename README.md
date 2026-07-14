<img src="charming-icon.png" alt="Charming" width="80" />

# Charming MCP Server

Charming is a hosted MCP server that generates, hosts, and updates interactive web apps. Connect it to any MCP-compatible AI client and ask it to build an app — you get back a live URL in seconds.

## Connect

| Client | Endpoint |
|--------|----------|
| Claude, Grok, Gemini, Perplexity | `https://charm.ing/mcp` |
| ChatGPT | `https://charm.ing/mcp/chatgpt` (or the Charming listing in the ChatGPT Apps directory) |

OAuth with Dynamic Client Registration is automatic — clients that support it show a one-time consent screen.

For per-client paste-strings and setup steps, see [usecharming.com/clients.txt](https://usecharming.com/clients.txt).

## Starter Prompt

Once Charming is connected, paste this to start a build session:

```
Help me figure out what to build. Look at what you know about me and suggest 2-3 apps that fit, or ask me up to 3 short questions to find an idea.

Read https://usecharming.com/start.md then help me create my first app.
```

## MCP Tools

Charming exposes 21 tools. Connected clients discover them automatically via `tools/list`.

| Tool | What it does |
|------|-------------|
| `create_app` | Store an agent-authored ES module plus optional UI and CSS, and render it inline. Returns the public app URL. |
| `update_app` | Edit an existing app by replacing its module/UI/styles or applying exact-string edits with optimistic-concurrency versioning. |
| `get_app` | Render an existing app inline (where the client supports it) and return its callable API operations and metadata. |
| `get_app_source` | Return the persisted module, UI, and styles for an existing app plus its current version. |
| `list_apps` | List the calling user's apps, newest first, with descriptions and capabilities. |
| `delete_app` | Delete an app's module entry. Pass `purge_storage: true` to also wipe stored state. |
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
| `share_app` | Invite another user to collaborate on an app; they accept the invite to get access. |
| `unshare_app` | Revoke a collaborator's access to an app. |
| `list_app_shares` | List active and pending share invites for one of your apps. |
| `set_public` | Make an app public: anyone with the URL can open it with no login. |
| `unset_public` | Make a public app private again; anonymous visitors can no longer open it. |

## Use with a coding agent

Working in Codex, Claude Code, Cursor, or another AI coding agent? Install the Charming authoring skill from [skills.sh](https://www.skills.sh):

```bash
npx skills add tambo-labs/charming-mcp
```

It teaches the agent Charming's build contract and workflow. The skill itself is [`SKILL.md`](./SKILL.md); [`AGENTS.md`](./AGENTS.md) has connect and authoring instructions for any AI coding agent. Codex users can instead install the bundled [Charming Codex plugin](https://github.com/tambo-labs/buildy-codex-plugin).

## Documentation

- Agent skill: [`SKILL.md`](./SKILL.md) · coding-agent guide: [`AGENTS.md`](./AGENTS.md)
- Full authoring guide: [usecharming.com/llms-full.txt](https://usecharming.com/llms-full.txt)
- OpenAPI spec: [charm.ing/openapi.json](https://charm.ing/openapi.json)
- Docs: [usecharming.com/docs](https://usecharming.com/docs)

## Publisher

Published by [Tambo](https://tambo.co).
