---
name: buildy
description: Create, update, inspect, or troubleshoot Buildy-hosted interactive web apps, or connect an AI client to Buildy.
---

# Buildy

## Overview

Use this skill when the user asks to create an app with Buildy, edit an existing Buildy app, connect the Buildy MCP server, or inspect Buildy-generated app source.

Buildy is a hosted service that generates, hosts, and updates small interactive web apps. Each app gets a real URL, persistent storage, and inline rendering inside MCP Apps-capable chat clients. It has two authoring paths:

- **MCP tools** (preferred): use this path whenever Buildy tools such as `create_app`, `update_app`, `list_apps`, or `get_app` are available to you.
- **HTTP API** (fallback): use only when Buildy MCP tools are not available and you have outbound HTTP access.

## Connect

Buildy is a remote server; there is nothing to clone, build, or run locally. Add the endpoint to your client's MCP settings:

| Client | Endpoint |
|--------|----------|
| Claude, Grok, Gemini, Perplexity, and most MCP clients | `https://app.buildy.so/mcp` |
| ChatGPT | `https://app.buildy.so/mcp/chatgpt` (or the Buildy listing in the ChatGPT Apps directory) |

OAuth with Dynamic Client Registration runs automatically on first connect: clients that support it show a one-time consent screen, with no API key to paste. Anonymous app creation also works with no auth (the first app mints a short-lived token). Per-client paste-strings and setup steps live at [buildy.so/clients.txt](https://buildy.so/clients.txt).

## MCP workflow

When Buildy MCP tools are available, build with the tools directly. Do not use `curl`, `fetch`, shell HTTP calls, or the raw HTTP API for app creation.

1. Read the starter guide at [buildy.so/build-mcp.md](https://buildy.so/build-mcp.md).
2. Read the design guide at [buildy.so/design.md](https://buildy.so/design.md) before writing UI code.
3. Create the first version with `create_app({ module, ui, styles? })`.
4. Give the user the returned app URL and `app_id`.
5. If the host does not render the app inline, share the returned URL so the user can open it directly. Do not claim the app is visible inline unless the host actually rendered it.
6. Offer one concrete next iteration, then call `update_app` only after the user agrees.
7. If the user hits a Buildy limitation, call `submit_feedback({ app_id, text })` instead of silently working around it.

Buildy exposes 21 tools; connected clients discover them via `tools/list`. The core authoring set is `create_app`, `update_app`, `get_app`, `get_app_source`, `list_apps`, and `delete_app`. Beyond those, `query_app` / `mutate_app` run an app's backend operations without editing code; `upload_asset` stores static assets; `share_app` / `unshare_app` / `list_app_shares`, `set_public` / `unset_public`, and `set_remixable` / `unset_remixable` control access and remixing; `rename_app`, `set_handle`, and `set_starter_prompt` manage URLs and share prompts; `submit_feedback` / `list_feedback` capture app feedback. The full descriptions live in the [README](./README.md) and [buildy.so/llms-full.txt](https://buildy.so/llms-full.txt).

Generated app code must follow the Buildy contract:

- `module` is one ES module with a static `manifest` export and a default object exposing `fetch(request, env, ctx)`.
- `ui` is one inline JavaScript program that populates `#app`.
- UI code calls the backend through `window.buildy.api(manifest.id)`.
- Do not manage tokens in UI code; credentials attach automatically.
- No Node APIs, no DOM APIs in the backend, no outbound app `fetch`, no external UI scripts, no native form submit, and no `alert`, `confirm`, or `prompt`.

## HTTP fallback

When Buildy MCP tools are not available, follow [buildy.so/start.md](https://buildy.so/start.md) and then [buildy.so/build-http.md](https://buildy.so/build-http.md). Prefer MCP setup first if the user asked for a connector or if the client can install the MCP server.

## Output expectations

When creating or updating an app, end with the app URL, the `app_id`, what changed, and the next practical iteration.
