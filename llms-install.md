# Charming MCP — install for Cline

Charming is a remote, hosted MCP server. There is nothing to clone, build, or run locally — just add the remote endpoint to your MCP settings.

## Add the server

Add this to Cline's MCP settings (`cline_mcp_settings.json`):

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

## Auth

The MCP endpoint requires a bearer token, and OAuth with Dynamic Client Registration bootstraps one on first connect: a one-time consent screen, no API key to paste. Anonymous creation with no token is available on the HTTP path only. Full auth guide: https://usecharming.com/auth.md

## First use

Once connected, paste this to start:

```
Read https://usecharming.com/start.md then help me create my first app.
```

Charming returns a live URL you can open, pin, or share; the app stays live at that URL and any MCP client can keep using it.
