# AGENTS.md

Instructions for AI coding agents working with Buildy.

Buildy is a hosted MCP server that generates, hosts, and updates interactive web apps. Ask it to build an app and you get back a live URL with persistent storage in seconds. The app keeps working after the chat closes, and any MCP client can keep using and updating it.

## Connect first

Buildy is remote and hosted; there is nothing to clone, build, or run. Add the endpoint to your MCP settings:

| Client | Endpoint |
|--------|----------|
| Claude, Grok, Gemini, Perplexity, and most MCP clients | `https://app.buildy.so/mcp` |
| ChatGPT | `https://app.buildy.so/mcp/chatgpt` (or the Buildy listing in the ChatGPT Apps directory) |
| Codex (plugin) | `codex plugin marketplace add https://github.com/tambo-labs/buildy-codex-plugin.git` |

OAuth with Dynamic Client Registration runs automatically: a one-time consent screen, no API key to paste. Anonymous creation works with no auth (the first app mints a short-lived token). Per-client paste-strings and setup steps: [buildy.so/clients.txt](https://buildy.so/clients.txt).

## Two authoring paths

- **MCP tools** (preferred): when Buildy tools such as `create_app` and `update_app` are available, build with them directly. Do not use `curl`, `fetch`, or the raw HTTP API for app creation.
- **HTTP API** (fallback): only when MCP tools are unavailable and you have outbound HTTP access. Follow [buildy.so/build-http.md](https://buildy.so/build-http.md).

## Build flow

1. Read [buildy.so/start.md](https://buildy.so/start.md), then the surface-specific starter: [build-mcp.md](https://buildy.so/build-mcp.md) or [build-http.md](https://buildy.so/build-http.md).
2. Read [buildy.so/design.md](https://buildy.so/design.md) before writing any UI, so the app avoids the generic-AI-app look.
3. Create the first version, hand back the app URL and `app_id`, then offer one concrete next iteration before editing again.
4. If a host does not render the app inline, share the URL; never claim it rendered inline unless it did.
5. Hit a limitation? Call `submit_feedback` instead of working around it silently.

## The app contract

Generated app code must follow this shape:

- `module`: one ES module with a static `manifest` export and a default object exposing `fetch(request, env, ctx)`.
- `ui`: one inline JavaScript program that populates `#app` and talks to the backend through `window.buildy.api(manifest.id)`.
- Do not manage tokens in UI code; credentials attach automatically.
- Not allowed: Node APIs, DOM APIs in the backend, outbound app `fetch`, external UI scripts, native form submit, `alert` / `confirm` / `prompt`.

## Tools

Buildy exposes 21 MCP tools; connected clients discover them via `tools/list`. Core authoring: `create_app`, `update_app`, `get_app`, `get_app_source`, `list_apps`, `delete_app`. See the [README](./README.md) for the full table and [buildy.so/llms-full.txt](https://buildy.so/llms-full.txt) for the complete authoring manual.

## Docs

- Authoring manual: [buildy.so/llms-full.txt](https://buildy.so/llms-full.txt)
- Agent-facing index: [buildy.so/llms.txt](https://buildy.so/llms.txt)
- OpenAPI spec: [app.buildy.so/openapi.json](https://app.buildy.so/openapi.json)
- Human docs: [buildy.so/docs](https://buildy.so/docs)

Published by [Tambo](https://tambo.co).
