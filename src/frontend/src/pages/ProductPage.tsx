import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Coffee,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { useMemo, useState } from "react";
import { RoastLevel } from "../backend";
import { useGetProduct, useListProducts } from "../hooks/useQueries";
import { formatIDR, safeImageUrl, useCartStore } from "../store/cart";

/* ---------------------------------------------------------------------------
   Roast level presentation — label + swatch tone
--------------------------------------------------------------------------- */

const ROAST_META: Record<RoastLevel, { label: string; dot: string }> = {
  [RoastLevel.light]: { label: "Light", dot: "bg-[oklch(0.78_0.11_78)]" },
  [RoastLevel.medium]: { label: "Medium", dot: "bg-[oklch(0.62_0.13_58)]" },
  [RoastLevel.mediumDark]: {
    label: "Medium Dark",
    dot: "bg-[oklch(0.46_0.09_48)]",
  },
  [RoastLevel.dark]: { label: "Dark", dot: "bg-[oklch(0.3_0.05_45)]" },
};

function RoastBadge({ level }: { level: RoastLevel }) {
  const meta = ROAST_META[level];
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1">
      <span
        className={`h-2.5 w-2.5 rounded-full ${meta.dot}`}
        aria-hidden="true"
      />
      <span className="spec-label uppercase text-secondary-foreground">
        {meta.label}
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Not-found state
--------------------------------------------------------------------------- */

function NotFound() {
  return (
    <div
      data-ocid="product.not_found_state"
      className="container flex flex-col items-center py-24 text-center"
    >
      <span className="kicker text-muted-foreground">
        404 — Tidak ditemukan
      </span>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
        Biji kopi ini tidak ada
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Produk yang kamu cari mungkin sudah habis atau tautannya salah. Lihat
        koleksi kami yang lain.
      </p>
      <Link
        to="/shop"
        search={{}}
        data-ocid="product.back_to_shop_link"
        className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke katalog
      </Link>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Loading skeleton
--------------------------------------------------------------------------- */

function ProductSkeleton() {
  const ids = Array.from({ length: 6 }, (_, i) => `product-skeleton-${i}`);
  return (
    <div
      data-ocid="product.loading_state"
      className="container grid gap-12 py-12 lg:grid-cols-2 lg:py-16"
    >
      <div className="aspect-square animate-pulse rounded-xl border border-border bg-muted" />
      <div className="space-y-4">
        {ids.map((id) => (
          <div
            key={id}
            className="h-6 animate-pulse rounded bg-muted"
            style={{ width: `${60 + (id.length % 4) * 10}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Product detail page
--------------------------------------------------------------------------- */

export default function ProductPage() {
  const { slug } = useParams({ from: "/shop/$slug" });
  const addItem = useCartStore((state) => state.addItem);

  // The backend getProduct hook expects a numeric id, so resolve the slug
  // through the catalog list first.
  const { data: products, isLoading: listLoading } = useListProducts();
  const matched = useMemo(
    () => products?.find((product) => product.slug === slug),
    [products, slug],
  );

  const { data: product, isLoading: productLoading } = useGetProduct(
    matched?.id,
  );

  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const isLoading = listLoading || (matched !== undefined && productLoading);

  if (isLoading) return <ProductSkeleton />;
  if (!product) return <NotFound />;

  const activeWeight =
    product.weightOptions.find((option) => option.weight === selectedWeight) ??
    product.weightOptions[0];

  const unitPrice = activeWeight ? Number(activeWeight.price) : 0;
  const subtotal = unitPrice * quantity;
  const canAdd = product.inStock && activeWeight !== undefined;
  const imageUrl = safeImageUrl(product.image);

  const handleAdd = () => {
    if (!canAdd || !activeWeight) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        weight: activeWeight.weight,
        unitPrice,
        imageUrl: imageUrl ?? "",
      },
      quantity,
    );
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div data-ocid="product.page" className="container py-10 lg:py-16">
      <Link
        to="/shop"
        search={{}}
        data-ocid="product.back_link"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Katalog
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Media */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-xl border border-border bg-secondary">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`Kemasan ${product.name}`}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center text-muted-foreground">
                <Coffee className="h-16 w-16" aria-hidden="true" />
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/55">
                <span className="spec-label rounded-full bg-background px-4 py-2 uppercase tracking-widest text-foreground">
                  Stok habis
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-3">
            <RoastBadge level={product.roastLevel} />
            {product.inStock ? (
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full bg-accent"
                  aria-hidden="true"
                />
                <span className="spec-label uppercase text-accent">
                  Freshness
                </span>
              </span>
            ) : (
              <span className="spec-label uppercase text-destructive">
                Stok habis
              </span>
            )}
          </div>

          <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-3 spec-label uppercase text-muted-foreground">
            Origin — {product.origin}
          </p>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Tasting notes */}
          {product.tastingNotes.length > 0 && (
            <div className="mt-8">
              <p className="kicker text-muted-foreground">Tasting notes</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.tastingNotes.map((note) => (
                  <li
                    key={note}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weight selector */}
          <div className="mt-8">
            <p className="kicker text-muted-foreground">Pilih berat</p>
            <fieldset className="mt-3">
              <legend className="sr-only">Pilih berat</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {product.weightOptions.map((option) => {
                  const isActive = activeWeight?.weight === option.weight;
                  return (
                    <label
                      key={option.weight}
                      data-ocid={`product.weight_option.${option.weight}`}
                      className={`flex cursor-pointer flex-col items-start rounded-lg border px-4 py-3 text-left transition-smooth ${
                        isActive
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="product-weight"
                        value={option.weight}
                        checked={isActive}
                        onChange={() => setSelectedWeight(option.weight)}
                        className="sr-only"
                      />
                      <span className="spec-label uppercase text-foreground">
                        {option.weight}
                      </span>
                      <span className="mt-1 spec-label text-muted-foreground">
                        {formatIDR(Number(option.price))}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* Quantity + subtotal */}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-border pt-6">
            <div>
              <p className="kicker text-muted-foreground">Jumlah</p>
              <div className="mt-3 inline-flex items-center rounded-full border border-border bg-card">
                <button
                  type="button"
                  data-ocid="product.quantity_decrease_button"
                  aria-label="Kurangi jumlah"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span
                  data-ocid="product.quantity_value"
                  className="spec-label w-10 text-center text-base text-foreground"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  data-ocid="product.quantity_increase_button"
                  aria-label="Tambah jumlah"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <p className="kicker text-muted-foreground">Subtotal</p>
              <p
                data-ocid="product.subtotal"
                className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground"
              >
                {formatIDR(subtotal)}
              </p>
            </div>
          </div>

          {/* Add to cart */}
          <div className="mt-6">
            <button
              type="button"
              data-ocid="product.add_to_cart_button"
              disabled={!canAdd}
              onClick={handleAdd}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              {justAdded ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Ditambahkan ke keranjang
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  {product.inStock ? "Tambah ke keranjang" : "Stok habis"}
                </>
              )}
            </button>
            {!product.inStock && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                Produk ini sedang tidak tersedia. Coba varian lain di katalog.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
