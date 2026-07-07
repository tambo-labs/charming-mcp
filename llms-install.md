# Buildy MCP — install for Cline

Buildy is a remote, hosted MCP server. There is nothing to clone, build, or run locally — just add the remote endpoint to your MCP settings.

## Add the server

Add this to Cline's MCP settings (`cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "buildy": {
      "url": "https://app.buildy.so/mcp",
      "type": "streamableHttp"
    }
  }
}
```

## Auth

OAuth with Dynamic Client Registration runs automatically on first connect — you'll get a one-time consent screen, no API key to paste. Anonymous app creation also works with no auth (the first app mints a short-lived token).

## First use

Once connected, paste this to start:

```
Read https://buildy.so/start.md then help me create my first app.
```

Buildy returns a live URL you can open, pin, or share; the app persists after the chat and any MCP client can keep using it.
