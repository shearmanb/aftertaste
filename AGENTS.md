<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deployment Rules

Railway deploys from the **real GitHub repo** (`shearmanb/aftertaste`), NOT from the internal `origin` proxy. The two have different commit histories.

## After every commit, you MUST:
1. Push to GitHub using the `mcp__github__push_files` tool (or `git push github main` if the `github` remote is configured)
2. Verify the commit landed by calling `mcp__github__list_commits` and confirming the SHA matches

## Before declaring a task done:
- Confirm the build succeeded by checking that Railway's active deployment hash changed, OR check build logs if the user reports something isn't working
- Never assume `git push origin` is sufficient — always push to GitHub explicitly
