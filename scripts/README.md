# Scripts

## sync-env.ts

Syncs environment variables from `.env.local` to Convex environment using the `convex env set` command.

### Usage

```bash
bun run convex:sync-env
```

Or directly:

```bash
bun run scripts/sync-env.ts
```

### How it works

1. Reads `.env.local` from the project root
2. Parses all `KEY=VALUE` pairs (skips comments and empty lines)
3. Runs `convex env set KEY VALUE` for each variable
4. **Overwrites existing values by default** (Convex's default behavior)

### .env.local Format

```env
# Comments are ignored
KEY=value
ANOTHER_KEY="value with spaces"
THIRD_KEY='single quotes work too'
```

### Requirements

- `.env.local` file must exist in the project root
- `convex` CLI must be installed and authenticated
- Bun runtime

### Notes

- The `convex env set` command overwrites values by default, so running this script multiple times is safe
- Empty lines and comments (lines starting with `#`) are automatically skipped
- Quoted values (single or double quotes) are automatically unwrapped

