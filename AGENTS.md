# Project Guidance

## User Preferences

- Indonesian-language request; site content may be in Indonesian or English as appropriate for a local coffee shop
- Core product is coffee beans (biji kopi)

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Seeding Storage.ExternalBlob fields with an empty blob is fatal: core-infrastructure's downloadFile calls StorageClient.getDirectURL(hash) during candid decode and throws 'Hash must not be empty', rejecting the whole Promise.all list query. Seed image blobs as Text.encodeUtf8("!caf!sha256:<64hex>") so decoding always succeeds.
- Motoko has no triple-quoted multi-line string literal — build long static Text with "...\n" # "...\n" concatenation.
- `query` is a reserved Motoko keyword and cannot be a parameter name; rename to e.g. productQuery.
- Motoko does not support list patterns in switch cases; use array.size() with case (0) and index array[0].
- OQL manual mode is required when a row record carries collection or variant fields; every value module used by a .payload extractor must be imported top-level in the declaring file, and each entity must call .sample(...).
- A getApiDoc mixin must contain only the getApiDoc declaration — any top-level let/var in a mixin is stable state and traps at runtime.
- This project is Tailwind v3: the v4 @theme syntax is inert and @apply bg-background fails the build. Declare semantic color tokens in tailwind.config.js theme.extend.colors as oklch(var(--token)).
- main.tsx is a protected template file that already wraps App with QueryClientProvider + InternetIdentityProvider; mount RouterProvider inside App.tsx instead.
- TanStack Router code-based routing (createRootRoute/createRoute/createRouter + RouterProvider) is the working pattern for the pinned 1.131.x version; declare the Register interface for typed Link `to` values, and pass search={{}} when linking to a route that declares validateSearch.
- Product.image is an ExternalBlob rendered via getDirectURL(); guard missing/empty blobs through a shared safeImageUrl helper. Product.weightOptions[].price is a bigint — convert with Number() before formatting IDR.
- Gate admin pages on useInternetIdentity().isAuthenticated combined with useIsCallerAdmin(); never use isLoginSuccess, which is only true right after an interactive popup login.
- Object-storage uploads: ExternalBlob.fromBytes(bytes, file.type, file.name).withUploadProgress(cb), stored directly on the record.
- The visual-testing skill leaves an untracked src/frontend/src/mocks/backend.ts that can drift from backendInterface and break pnpm typecheck; it must satisfy every interface member.
