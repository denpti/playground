# Project 000

## Testing process

1. Build the console script
`pnpm run build:console:compile`
2. Run the console script
`GITHUB_TOKEN=sljcnsdclnsnclsndcskclsn USER_AGENT="Amazing App 123" node dist/console.js`

## Publish process

1. Commit any changes to the repository.
2. `pnpm version patch | minor | major`
3. `pnpm publish`
