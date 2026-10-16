import { Link } from "@tanstack/react-router";
import { Coffee } from "lucide-react";
import type { Product } from "../backend";
import { RoastLevel } from "../backend";
import { formatIDR } from "../store/cart";

const ROAST_LABEL: Record<RoastLevel, string> = {
  [RoastLevel.light]: "Light",
  [RoastLevel.medium]: "Medium",
  [RoastLevel.mediumDark]: "Medium Dark",
  [RoastLevel.dark]: "Dark",
};

const ROAST_TONE: Record<RoastLevel, string> = {
  [RoastLevel.light]: "bg-secondary text-secondary-foreground",
  [RoastLevel.medium]: "bg-primary/15 text-primary",
  [RoastLevel.mediumDark]: "bg-primary/25 text-primary",
  [RoastLevel.dark]: "bg-foreground text-background",
};

export function roastLabel(level: RoastLevel): string {
  return ROAST_LABEL[level] ?? "Roast";
}

export function lowestPrice(product: Product): number | null {
  if (product.weightOptions.length === 0) return null;
  return Math.min(
    ...product.weightOptions.map((option) => Number(option.price)),
  );
}

export function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const price = lowestPrice(product);
  const weight = product.weightOptions[0]?.weight;

  return (
    <Link
      to="/shop/$slug"
      params={{ slug: product.slug }}
      data-ocid={`home.product_card.${index + 1}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-none transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {product.image ? (
          <img
            src={product.image.getDirectURL()}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Coffee className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
        <span
          className={`spec-label absolute left-3 top-3 rounded-full px-2.5 py-1 ${ROAST_TONE[product.roastLevel]}`}
        >
          {roastLabel(product.roastLevel)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground">
            {product.name}
          </h3>
          <p className="spec-label mt-1 text-muted-foreground">
            Origin: {product.origin}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <span className="spec-label flex items-center gap-1.5 text-muted-foreground">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                product.inStock ? "bg-accent" : "bg-destructive"
              }`}
              aria-hidden="true"
            />
            {product.inStock ? "In stock" : "Sold out"}
          </span>
          {weight && (
            <span className="spec-label text-muted-foreground">{weight}</span>
          )}
        </div>

        <p className="spec-label text-base font-semibold text-foreground">
          {price === null ? "—" : formatIDR(price)}
        </p>
      </div>
    </Link>
  );
}

export default ProductCard;
