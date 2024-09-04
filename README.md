# Cloudflare Pages Clean-up Job

If you have deployed some pages on Cloudflare Pages,
you might have noticed that the old build stay there forever
(and are reachable via their unique URLs).

This scheduled worker will clean up all builds that are:

- either older than 3 days
- or were skipped

## How to use

1. Find your account ID and add it to the [`wrangler.toml`](./wrangler.toml) file
2. Create new API token with worker access permissions and save it as a secret as `API_TOKEN`
3. Deploy the worker with `wrangler deploy`

Done!
Now every night, the worker will clean up old builds.
