# API contracts

## Update an existing contract

Update its file under `src/`.

## Add a new contract

1. Add `src/<name>.ts` and export the public request or response types. Do not
   import Subway models or services. Relative imports must use `.js` extensions.
2. Add the subpath to `package.json`:

   ```json
   "./<name>": {
     "types": "./dist/<name>.d.ts",
     "default": "./dist/<name>.js"
   }
   ```

3. Import it with `@upchieve/api-contracts/<name>`. If a Subway model has a
   different shape, convert it with a mapper under `server/contracts/`.

## Local development

After changing a contract:

- Build it so Subway sees the changes through the local workspace package:

  ```sh
  pnpm run build:api-contracts
  ```

- Verify that the contract types compile without errors:

  ```sh
  pnpm --filter @upchieve/api-contracts typecheck
  ```

- Verify that the package exports point to existing files and its types resolve
  correctly:

  ```sh
  pnpm --filter @upchieve/api-contracts validate:artifact
  ```

## Development release

From an MR pipeline, manually run `publish_api_contracts_preview`. The job
publishes an MR-scoped prerelease and prints the exact version for High Line to
install.

## Production release

Update the version in `packages/api-contracts/package.json` before merging. Once
the change is on `main`, manually run `publish_api_contracts` to publish it with
the `latest` tag.
