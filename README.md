# Markhor Albion

Premium travel journal and destination guide.

## Development

Requires Bun and Node.js.

```sh
bun install
bun run dev
```

## Build and deploy

Cloudflare Workers Builds is connected to the `main` branch.

```sh
bun run build
npx wrangler deploy
```

Push commits to `main` to trigger a production build and deployment.
