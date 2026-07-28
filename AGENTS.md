# AGENTS.md

Instructions for AI coding agents working with Charming.

Charming is a hosted MCP server that generates, hosts, and updates interactive web apps. Ask it to build an app and you get back a live URL with persistent storage in seconds. The app stays live at that URL, and any MCP client can keep using and updating it.

## Connect first

Charming is remote and hosted; there is nothing to clone, build, or run. Add the endpoint to your MCP settings:

| Client | Endpoint |
|--------|----------|
| Claude, Claude Code, Cursor, Codex, Gemini CLI, and most MCP clients | `https://charm.ing/mcp` |
| ChatGPT | the Charming listing in the ChatGPT Apps directory is one click; `https://charm.ing/mcp/chatgpt` is the Developer Mode fallback |
| Codex (plugin) | `codex plugin marketplace add https://github.com/tambo-labs/charming-codex-plugin.git` |
| Cursor | `https://charm.ing/mcp` (plus drop [`.cursor/rules/charming.mdc`](./.cursor/rules/charming.mdc) into your project) |

The MCP endpoints always require a bearer token; OAuth with Dynamic Client Registration bootstraps one automatically, with no API key to paste. Anonymous creation with no token is available on the HTTP path only, and an unclaimed app expires after 7 days. Auth guide: [usecharming.com/auth.md](https://usecharming.com/auth.md). Per-client paste-strings: [usecharming.com/clients.txt](https://usecharming.com/clients.txt).

## Two authoring paths

- **MCP tools** (preferred): when Charming tools such as `create_app` and `update_app` are available, build with them directly. Do not use `curl`, `fetch`, or the raw HTTP API for app creation.
- **HTTP API** (fallback): only when MCP tools are unavailable and you have outbound HTTP access. Follow [usecharming.com/build-http.md](https://usecharming.com/build-http.md).

## Build flow

1. Read [usecharming.com/start.md](https://usecharming.com/start.md), then the surface-specific starter: [build-mcp.md](https://usecharming.com/build-mcp.md) or [build-http.md](https://usecharming.com/build-http.md).
2. Read [usecharming.com/design.md](https://usecharming.com/design.md) before writing any UI, so the app avoids the generic-AI-app look.
3. Create the first version, hand back the app URL and `app_id`, then offer one concrete next iteration before editing again.
4. If a host does not render the app inline, share the URL; never claim it rendered inline unless it did.
5. Hit a limitation? Call `submit_feedback` instead of working around it silently.

## The app contract

Generated app code must follow this shape:

- `module`: one ES module with two named exports and no required default export. `manifest` is a plain literal (parsed statically, so no computed values) carrying `$schema`, `id`, `meta.name`, an optional emoji `meta.icon`, and `capabilities.imports`. `routes` is an array of operations, each with `op`, `method`, `path`, `title`, `description`, `inputSchema`, `outputSchema`, `annotations`, and a `handler(input, { env, ctx, request })` returning a JSON-compatible value. Mark reads with `annotations.readOnlyHint: true` or `query_app` cannot call them.
- `ui`: one inline JavaScript program that populates `#app` and talks to the backend through `window.charming.api(manifest.id).<op>(input)`. Subscribe with `window.charming.onStateChange(cb)` for live updates, and patch the DOM surgically instead of replacing `innerHTML`.
- `env.storage` is Workers KV with only `.get`, `.put`, `.delete`, and `.list`, and it stores JSON-compatible values directly. Do not `JSON.stringify` before `put`.
- Declare capabilities in `manifest.capabilities.imports` (`charming:storage/kv@1.0` for `env.storage`, plus blob storage, logging, `charming:network/fetch@1.0` for backend fetch, secrets, browser permissions, and cross-app imports). Never invent an import string. Backend `fetch` needs BOTH the `charming:network/fetch@1.0` import and origins in `permissions.server.fetch`, since origins alone leave egress blocked; external images need `permissions.browser["img-src"]` or they do not render.
- Legacy `export default { fetch(request, env, ctx) }` still works as the unmatched-path fallback but carries no method or read-only metadata, so author operations as routes. `manifest.capabilities.exports` is rejected by the current schema.
- Do not manage tokens in UI code; credentials attach automatically.
- Not allowed: Node APIs, DOM APIs in the backend, outbound app `fetch`, external UI scripts, native form submit, `alert` / `confirm` / `prompt`.

## Tools

Charming exposes 21 MCP tools; connected clients discover them via `tools/list`. Core authoring: `create_app`, `update_app`, `get_app`, `get_app_source`, `list_apps`, `delete_app`. See the [README](./README.md) for the full table and [usecharming.com/llms-full.txt](https://usecharming.com/llms-full.txt) for the complete authoring manual.

## Docs

- Authoring manual: [usecharming.com/llms-full.txt](https://usecharming.com/llms-full.txt)
- Auth, pairing, and token recovery: [usecharming.com/auth.md](https://usecharming.com/auth.md)
- Limits and rate limits: [usecharming.com/pricing.md](https://usecharming.com/pricing.md)
- Agent-facing index: [usecharming.com/llms.txt](https://usecharming.com/llms.txt)
- OpenAPI spec: [charm.ing/.well-known/openapi.json](https://charm.ing/.well-known/openapi.json)
- Human docs: [usecharming.com/docs](https://usecharming.com/docs)

Published by [Tambo](https://tambo.co).
