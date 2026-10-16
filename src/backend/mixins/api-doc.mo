mixin () {
  /// Static, human-readable documentation of the public backend API.
  /// Authored from the current source; reads no runtime state.

  public query func getApiDoc() : async Text {
    "# Kopi Nusantara — Backend API\n" #
    "\n" #
    "Backend for a coffee-bean (biji kopi) storefront: a public product catalog,\n" #
    "order placement, and admin order management.\n" #
    "\n" #
    "## Authentication and identity\n" #
    "\n" #
    "- The frontend authenticates users with Internet Identity. The app pins an\n" #
    "  Internet Identity derivation origin, published at\n" #
    "  `/.well-known/ii-derivation-origin` when available. An agent already holding\n" #
    "  the user's Internet Identity authorization derives the correct per-app\n" #
    "  principal against that origin (for example\n" #
    "  `icp identity link web <name> --app <host>`). Such a delegation acts with the\n" #
    "  user's full authority in this app until it expires.\n" #
    "- A principal that never signed in through this app's own frontend is\n" #
    "  **unregistered**, even when it belongs to the app's owner. A signed-in caller\n" #
    "  derived against a different origin is a different principal than the one the\n" #
    "  frontend registered.\n" #
    "- Registration happens only through the app's own frontend sign-in flow. A\n" #
    "  direct API caller must register by calling `_initialize_access_control` once\n" #
    "  as a signed-in caller before any role-guarded call. The first caller to\n" #
    "  initialize receives the `#admin` role; subsequent callers receive the\n" #
    "  `#user` role.\n" #
    "- Admin-only endpoints trap with `Unauthorized: Only admins can ...` for any\n" #
    "  caller that is not an admin. Anonymous callers are never admins.\n" #
    "\n" #
    "## Public methods\n" #
    "\n" #
    "### Reads (query)\n" #
    "\n" #
    "- `getBusinessInfo() : BusinessInfo` — shop name, tagline, phone, email,\n" #
    "  address, and opening hours. Public.\n" #
    "- `listProducts(productQuery : ProductQuery) : [Product]` — the catalog,\n" #
    "  filtered by `search` (case-insensitive match on name or origin), `roastLevel`,\n" #
    "  and `origin` (case-insensitive exact match), then sorted by `sort`\n" #
    "  (`#priceAsc`, `#priceDesc`, `#nameAsc`, `#nameDesc`; default `#nameAsc`).\n" #
    "  Price sorting uses each product's lowest weight-option price. Public.\n" #
    "- `getProduct(id : ProductId) : ?Product` — one product, or `null` when absent.\n" #
    "  Public.\n" #
    "- `listOrders() : [Order]` — all orders, newest first by `createdAt`.\n" #
    "  **Admin only.**\n" #
    "- `isCallerAdmin() : Bool` — whether the caller holds the admin role.\n" #
    "- `getCallerUserRole() : UserRole` — the caller's role (`#admin` or `#user`).\n" #
    "\n" #
    "### Writes (update)\n" #
    "\n" #
    "- `createOrder(input : OrderInput) : Order` — place an order. Public (no sign-in\n" #
    "  required). See \"Order placement\" below.\n" #
    "- `createProduct(product : Product) : ProductId` — add a product. **Admin only.**\n" #
    "- `updateProduct(product : Product) : ()` — replace an existing product by\n" #
    "  `id`; a no-op when the id does not exist. **Admin only.**\n" #
    "- `deleteProduct(id : ProductId) : ()` — remove a product. **Admin only.**\n" #
    "- `setProductStock(id : ProductId, inStock : Bool) : ()` — toggle stock; a no-op\n" #
    "  when the id does not exist. **Admin only.**\n" #
    "- `setOrderStatus(id : OrderId, status : OrderStatus) : ()` — set an order's\n" #
    "  status (`#new`, `#confirmed`, `#completed`); a no-op when the id does not\n" #
    "  exist. **Admin only.**\n" #
    "- `deleteOrder(id : OrderId) : ()` — remove an order. **Admin only.**\n" #
    "- `assignCallerUserRole(user : Principal, role : UserRole) : ()` — assign a role\n" #
    "  to another principal. **Admin only.**\n" #
    "\n" #
    "## Units and encoding\n" #
    "\n" #
    "- All prices and totals are whole Indonesian rupiah (IDR), stored as `Nat`\n" #
    "  (no decimals, no fractional part). `total` is the sum of line totals.\n" #
    "- `createdAt` is an `Int` nanosecond timestamp from the IC system clock.\n" #
    "- `ProductId` and `OrderId` are `Nat` identifiers assigned server-side,\n" #
    "  starting at 0 and incrementing.\n" #
    "- `OrderReference` is a human-facing string of the form `KB-000123` (the id\n" #
    "  zero-padded to six digits).\n" #
    "- `image` is an object-storage `ExternalBlob` reference; the frontend\n" #
    "  resolves it to a URL via `getDirectURL()`.\n" #
    "- `roastLevel` is a variant (`#light`, `#medium`, `#mediumDark`, `#dark`).\n" #
    "- `status` is a variant (`#new`, `#confirmed`, `#completed`).\n" #
    "\n" #
    "## Order placement\n" #
    "\n" #
    "`createOrder` validates the input and traps on any of:\n" #
    "\n" #
    "- empty `customerName`, `phone`, or `address`\n" #
    "- an empty `items` list\n" #
    "- an item with `quantity` of 0\n" #
    "- an item whose `productId` does not exist\n" #
    "- an item whose product is out of stock\n" #
    "- an item whose `weight` does not match one of the product's weight options\n" #
    "\n" #
    "**Order totals are recomputed server-side.** The client-supplied `unitPrice`\n" #
    "and `lineTotal` on each line item are ignored: the backend looks up the\n" #
    "product's price for the requested weight and recomputes `unitPrice`,\n" #
    "`lineTotal`, and the order `total`. `productName` is likewise taken from the\n" #
    "stored product, not the request.\n" #
    "\n" #
    "## Lifecycle and polling\n" #
    "\n" #
    "- A new order starts in `#new`. Admins move it to `#confirmed` then\n" #
    "  `#completed` via `setOrderStatus`.\n" #
    "- `listOrders` returns orders newest-first; poll it to pick up new orders.\n" #
    "  There is no push notification.\n" #
    "- Order confirmation email delivery is **best-effort**: `createOrder` awaits\n" #
    "  the email send but ignores its result, so a failed send does not fail the\n" #
    "  order. The order is persisted regardless.\n" #
    "- `email` is **optional**: when it is empty, `createOrder` skips the\n" #
    "  confirmation email entirely and still creates the order.\n" #
    "\n" #
    "## Mutation retry safety\n" #
    "\n" #
    "- `createOrder` is **not idempotent**: each successful call creates a new order\n" #
    "  with a new id and reference. Retrying a call that already succeeded creates a\n" #
    "  duplicate order.\n" #
    "- `createProduct` is **not idempotent**: each call assigns a new id.\n" #
    "- `updateProduct`, `setProductStock`, `setOrderStatus`, and `deleteProduct` /\n" #
    "  `deleteOrder` are idempotent in effect (repeating them converges to the same\n" #
    "  state), though `delete*` on an already-deleted id is a no-op.\n" #
    "- `assignCallerUserRole` is idempotent.\n" #
    "\n" #
    "## Errors and limits\n" #
    "\n" #
    "- Authorization failures trap with an `Unauthorized: ...` message.\n" #
    "- Validation failures in `createOrder` trap with a descriptive message (see\n" #
    "  \"Order placement\").\n" #
    "- `updateProduct` requires the product's `id` to already exist; otherwise it\n" #
    "  silently does nothing.\n" #
    "- There is no online payment at checkout and no customer accounts with order\n" #
    "  history; orders are placed as guest checkouts.\n" #
    "\n" #
    "## Data intelligence (OQL)\n" #
    "\n" #
    "The backend exposes its data through the Object Query Layer:\n" #
    "\n" #
    "- `schema() : Text` — JSON description of the queryable entities.\n" #
    "- `execute(qJson : Text) : Text` — run a JSON query.\n" #
    "\n" #
    "Two entities are queryable:\n" #
    "\n" #
    "- `product` — the public catalog (world-readable).\n" #
    "- `order` — incoming orders (controller-only; not readable by end users).\n";
  };
};
