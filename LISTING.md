# Buildy — MCP registry listing kit

Canonical copy + submission steps for listing Buildy across MCP registries. Framing: **"publish what your agent built" + persistence** — never "platform." Keep every listing consistent with this file so third-party citations don't fragment.

## Server metadata (source of truth)

- **Name:** Buildy
- **Endpoint:** `https://app.buildy.so/mcp` (streamable-http, remote hosted)
- **Auth:** OAuth / Dynamic Client Registration (automatic); anonymous app creation needs no token
- **Homepage:** https://buildy.so
- **Repo:** https://github.com/tambo-labs/buildy-mcp
- **Docs:** https://buildy.so/build-mcp.md , /build-http.md , /auth.md , /llms.txt , /clients.txt
- **OpenAPI:** https://app.buildy.so/.well-known/openapi.json
- **Tools:** 21 (discovered via `tools/list`)
- **Tags:** mcp-apps, app-hosting, personal-apps, generative-ui, persistence, agent-tools, pwa

## Blurb

**One-liner:** Publish the apps your agent builds. Buildy gives each one a real URL, a database, and an open API, so it outlives the chat and any MCP client can keep using it.

**Medium (form description):** Buildy is an MCP server that hosts the interactive web apps your agent builds. Ask your agent for a tracker, dashboard, or tool, and Buildy gives it a real URL, a hosted database, and an open API, then renders it inline in your MCP client. The app persists after the chat closes, and you can open, update, or share it from any agent — Claude, ChatGPT, Cursor, or any MCP host.

## Surfaces & how to submit

### 1 + 2. Official MCP Registry -> GitHub MCP Registry (VS Code @mcp)
The GitHub MCP Registry has **no separate submission** — it ingests from the official registry. Publish once; it flows downstream (hourly-ish). Then optionally email **partnerships@github.com** with the published name + URL for faster curated placement in github.com/mcp and VS Code's `@mcp` gallery.

```bash
# install
brew install mcp-publisher    # or the release binary

# authenticate (pick ONE — see namespace note below)
mcp-publisher login github     # -> io.github.tambo-labs/* (needs tambo-labs org membership)

# publish (server.json is in this repo)
mcp-publisher publish --dry-run
mcp-publisher publish
curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.tambo-labs/buildy"
```

**Namespace decision** (`name` in server.json):
- **Ready now — GitHub auth:** `io.github.tambo-labs/buildy` (current server.json). Any URL allowed; just needs org membership.
- **On-brand — DNS auth:** `so.buildy/buildy`. Add a TXT record to `buildy.so`, then `mcp-publisher login dns --domain buildy.so --private-key <key>`; remote URL must be on buildy.so (`app.buildy.so/mcp` qualifies). Aligns with the #1755 disambiguation strategy (avoids Tambo-branding). Switch the `name` field + re-publish if we go this way.

### 3. PulseMCP — https://www.pulsemcp.com/servers (Submit nav)
Hand-reviewed daily. Fields: name, endpoint, medium blurb, repo, tags. (Separate: newsletter "The Agentic Loop" feature = a human-sent founder email, not this form.)

### 4. Glama — https://glama.ai
Claim the Buildy listing (likely already auto-indexed) and complete it with the blurb, endpoint, repo, tags.

### 5. mcp.so — listing form
Submit: name, endpoint, medium blurb, repo.

### 6. Cline Marketplace — GitHub issue at https://github.com/cline/mcp-marketplace
Title: **Add Buildy MCP Server**
- GitHub Repo URL: https://github.com/tambo-labs/buildy-mcp
- Logo: 400x400 PNG at `buildy-icon.png` (repo root)
- Description: (one-liner above)
- Install: `llms-install.md` in repo root; remote endpoint, no local build
- Testing: connects via streamable-http; `tools/list` returns 21; `create_app` returns a live URL

## Status (record live URLs here as they go up)

- [x] Repo prep — llms-install.md, 21-tool README, 400x400 logo
- [ ] Official MCP Registry (-> GitHub MCP Registry + partnerships@github.com nudge)
- [ ] PulseMCP
- [ ] Glama
- [ ] mcp.so
- [ ] Cline Marketplace
