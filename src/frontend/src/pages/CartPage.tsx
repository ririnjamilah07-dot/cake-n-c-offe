import { Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  cartTotal,
  formatIDR,
  lineSubtotal,
  useCartStore,
} from "../store/cart";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = cartTotal(items);

  if (items.length === 0) {
    return (
      <div className="container py-20 md:py-28">
        <div
          data-ocid="cart.empty_state"
          className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-border bg-card px-8 py-16 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <ShoppingBag className="h-7 w-7" aria-hidden="true" />
          </span>
          <p className="kicker mt-6 text-muted-foreground">Keranjang kosong</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            Your cart is empty
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Belum ada biji kopi di keranjang. Jelajahi katalog dan pilih roast
            favoritmu.
          </p>
          <Button
            asChild
            data-ocid="cart.shop_link"
            className="mt-8 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/shop" search={{}}>
              Browse the shop
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-14 md:py-20">
      <header className="border-b border-border pb-6">
        <p className="kicker text-muted-foreground">Keranjang</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Your cart
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "line" : "lines"} ·{" "}
          <span className="spec-label">{formatIDR(total)}</span>
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <ul data-ocid="cart.list" className="space-y-4">
          {items.map((line, index) => (
            <li
              key={`${line.productId}-${line.weight}`}
              data-ocid={`cart.item.${index + 1}`}
              className="flex gap-4 rounded-xl border border-border bg-card p-4 sm:gap-5 sm:p-5"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                {line.imageUrl ? (
                  <img
                    src={line.imageUrl}
                    alt={line.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ShoppingBag className="h-6 w-6" aria-hidden="true" />
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to="/shop/$slug"
                      params={{ slug: line.slug }}
                      data-ocid={`cart.item_link.${index + 1}`}
                      className="block truncate font-display text-lg font-semibold tracking-tight transition-colors hover:text-primary"
                    >
                      {line.name}
                    </Link>
                    <p className="spec-label mt-1 text-muted-foreground">
                      {line.weight} · {formatIDR(line.unitPrice)}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-ocid={`cart.remove_button.${index + 1}`}
                    aria-label={`Remove ${line.name} from cart`}
                    onClick={() => removeItem(line.productId, line.weight)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      data-ocid={`cart.decrement_button.${index + 1}`}
                      aria-label={`Decrease quantity of ${line.name}`}
                      disabled={line.quantity <= 1}
                      onClick={() =>
                        updateQuantity(
                          line.productId,
                          line.weight,
                          line.quantity - 1,
                        )
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span
                      data-ocid={`cart.quantity.${index + 1}`}
                      className="spec-label w-8 text-center text-foreground"
                    >
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      data-ocid={`cart.increment_button.${index + 1}`}
                      aria-label={`Increase quantity of ${line.name}`}
                      onClick={() =>
                        updateQuantity(
                          line.productId,
                          line.weight,
                          line.quantity + 1,
                        )
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <p
                    data-ocid={`cart.subtotal.${index + 1}`}
                    className="spec-label text-base font-semibold text-foreground"
                  >
                    {formatIDR(lineSubtotal(line))}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="kicker text-muted-foreground">Ringkasan</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="spec-label text-foreground">
                  {formatIDR(total)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="spec-label text-muted-foreground">
                  Calculated at checkout
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
              <span className="font-display text-lg font-semibold">Total</span>
              <span
                data-ocid="cart.total"
                className="spec-label text-xl font-semibold text-foreground"
              >
                {formatIDR(total)}
              </span>
            </div>

            <Button
              asChild
              data-ocid="cart.checkout_button"
              className="mt-6 h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/checkout">
                Proceed to checkout
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>

            <Link
              to="/shop"
              search={{}}
              data-ocid="cart.continue_link"
              className="mt-4 block text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
