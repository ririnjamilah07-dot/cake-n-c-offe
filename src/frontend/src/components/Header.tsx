import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useGetBusinessInfo, useIsCallerAdmin } from "../hooks/useQueries";
import { cartCount, useCartStore } from "../store/cart";

const NAV_LINKS = [
  { to: "/shop", label: "Shop" },
  { to: "/", hash: "about", label: "About" },
  { to: "/", hash: "contact", label: "Contact" },
] as const;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const count = cartCount(items);
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { data: info } = useGetBusinessInfo();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          data-ocid="nav.home_link"
          className="font-display text-xl font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          {info?.name ?? "Cake N C offe"}
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              hash={"hash" in link ? link.hash : undefined}
              data-ocid={`nav.${link.label.toLowerCase()}_link`}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              data-ocid="nav.admin_link"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            data-ocid="nav.cart_button"
            aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
            className="relative inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-smooth hover:bg-foreground/90"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            <span
              data-ocid="nav.cart_count"
              className="spec-label inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-primary-foreground"
            >
              {count}
            </span>
          </Link>

          <button
            type="button"
            data-ocid="nav.menu_toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted md:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border bg-card md:hidden">
          <div className="container flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                hash={"hash" in link ? link.hash : undefined}
                data-ocid={`nav.mobile.${link.label.toLowerCase()}_link`}
                onClick={() => setMenuOpen(false)}
                className="border-b border-border/60 py-3 text-sm font-medium text-foreground last:border-b-0"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                data-ocid="nav.mobile.admin_link"
                onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-semibold text-primary"
              >
                Admin
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
