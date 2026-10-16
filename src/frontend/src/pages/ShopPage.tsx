import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  Coffee,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo } from "react";
import type {
  Product,
  ProductQuery,
  ProductSort,
  RoastLevel,
} from "../backend";
import {
  ProductSort as ProductSortEnum,
  RoastLevel as RoastLevelEnum,
} from "../backend";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { useListProducts } from "../hooks/useQueries";
import { formatIDR, safeImageUrl, useCartStore } from "../store/cart";

/* ---------------------------------------------------------------------------
   Static option tables — labels are display-only, values map to backend enums
--------------------------------------------------------------------------- */

const ROAST_OPTIONS: { value: RoastLevel; label: string }[] = [
  { value: RoastLevelEnum.light, label: "Light" },
  { value: RoastLevelEnum.medium, label: "Medium" },
  { value: RoastLevelEnum.mediumDark, label: "Medium Dark" },
  { value: RoastLevelEnum.dark, label: "Dark" },
];

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: ProductSortEnum.nameAsc, label: "Name · A–Z" },
  { value: ProductSortEnum.nameDesc, label: "Name · Z–A" },
  { value: ProductSortEnum.priceAsc, label: "Price · Low to High" },
  { value: ProductSortEnum.priceDesc, label: "Price · High to Low" },
];

const ROAST_LABEL: Record<RoastLevel, string> = {
  [RoastLevelEnum.light]: "Light",
  [RoastLevelEnum.medium]: "Medium",
  [RoastLevelEnum.mediumDark]: "Medium Dark",
  [RoastLevelEnum.dark]: "Dark",
};

const ALL = "__all__";

function isRoastLevel(value: string | undefined): value is RoastLevel {
  return (
    value === RoastLevelEnum.light ||
    value === RoastLevelEnum.medium ||
    value === RoastLevelEnum.mediumDark ||
    value === RoastLevelEnum.dark
  );
}

function isProductSort(value: string | undefined): value is ProductSort {
  return (
    value === ProductSortEnum.nameAsc ||
    value === ProductSortEnum.nameDesc ||
    value === ProductSortEnum.priceAsc ||
    value === ProductSortEnum.priceDesc
  );
}

/* ---------------------------------------------------------------------------
   Product card
--------------------------------------------------------------------------- */

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const defaultWeight = product.weightOptions[0];
  const price = defaultWeight ? Number(defaultWeight.price) : 0;
  const soldOut = !product.inStock;
  const imageUrl = safeImageUrl(product.image);

  const handleAdd = () => {
    if (soldOut || !defaultWeight) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      weight: defaultWeight.weight,
      unitPrice: price,
      imageUrl: imageUrl ?? "",
    });
  };

  return (
    <article
      data-ocid={`shop.card.${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-subtle transition-smooth hover:-translate-y-1 hover:shadow-lg"
    >
      <Link
        to="/shop/$slug"
        params={{ slug: product.slug }}
        data-ocid={`shop.card_link.${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-secondary"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${product.name} — ${ROAST_LABEL[product.roastLevel]} roast from ${product.origin}`}
            loading="lazy"
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Coffee className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 backdrop-blur">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${soldOut ? "bg-destructive" : "bg-accent"}`}
          />
          <span className="spec-label text-foreground">
            {soldOut ? "Sold out" : "In stock"}
          </span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-snug text-foreground">
            <Link
              to="/shop/$slug"
              params={{ slug: product.slug }}
              className="transition-colors hover:text-primary"
            >
              {product.name}
            </Link>
          </h3>
          <span className="spec-label shrink-0 rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
            {ROAST_LABEL[product.roastLevel]}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          Origin: <span className="text-foreground">{product.origin}</span>
        </p>

        <dl className="mt-auto space-y-1.5 border-t border-border pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="spec-label text-muted-foreground">Weight</dt>
            <dd className="spec-label text-foreground">
              {defaultWeight ? defaultWeight.weight : "—"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="spec-label text-muted-foreground">Price</dt>
            <dd className="spec-label text-base font-semibold text-foreground">
              {formatIDR(price)}
            </dd>
          </div>
        </dl>

        <Button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          data-ocid={`shop.add_button.${product.slug}`}
          className="mt-1 w-full rounded-full"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          {soldOut ? "Sold out" : "Add to cart"}
        </Button>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------------------
   Loading + empty states
--------------------------------------------------------------------------- */

function GridSkeleton() {
  const ids = Array.from({ length: 6 }, (_, i) => `shop-skeleton-${i}`);
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {ids.map((id) => (
        <div
          key={id}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Page
--------------------------------------------------------------------------- */

export default function ShopPage() {
  const search = useSearch({ from: "/shop" });
  const navigate = useNavigate({ from: "/shop" });

  const roast = isRoastLevel(search.roast) ? search.roast : undefined;
  const sort = isProductSort(search.sort) ? search.sort : undefined;
  const origin = search.origin;
  const q = search.q ?? "";

  const productQuery = useMemo<ProductQuery>(
    () => ({
      search: q.trim() ? q.trim() : undefined,
      roastLevel: roast,
      origin,
      sort,
    }),
    [q, roast, origin, sort],
  );

  const {
    data: products = [],
    isLoading,
    isError,
  } = useListProducts(productQuery);

  // Unfiltered catalog — keeps filter option lists stable regardless of selection.
  const { data: allProducts = [] } = useListProducts({});

  const originOptions = useMemo(() => {
    const set = new Set<string>();
    for (const product of allProducts) {
      if (product.origin) set.add(product.origin);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allProducts]);

  const hasActiveFilters = Boolean(roast || origin || sort || q.trim());

  const updateSearch = (patch: {
    roast?: string;
    origin?: string;
    sort?: string;
    q?: string;
  }) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
    });
  };

  const clearFilters = () => {
    void navigate({ search: {}, replace: true });
  };

  return (
    <div data-ocid="shop.page" className="bg-background">
      {/* Page header band */}
      <section className="border-b border-border bg-gradient-subtle">
        <div className="container py-14 md:py-20">
          <p className="kicker text-primary">Katalog</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Biji kopi, disangrai segar setiap minggu
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Pilih dari koleksi single-origin kami. Setiap kemasan mencantumkan
            tingkat sangrai, asal, dan berat — dipanggang dalam batch kecil.
          </p>
        </div>
      </section>

      {/* Controls */}
      <section
        data-ocid="shop.filters"
        className="border-b border-border bg-card"
      >
        <div className="container flex flex-col gap-4 py-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <label
              htmlFor="shop-search"
              className="kicker mb-2 block text-muted-foreground"
            >
              Cari
            </label>
            <Search
              className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="shop-search"
              type="search"
              value={q}
              onChange={(event) => updateSearch({ q: event.target.value })}
              placeholder="Cari nama atau asal…"
              data-ocid="shop.search_input"
              className="h-10 rounded-full pl-9"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:w-auto">
            <div>
              <label
                htmlFor="shop-roast"
                className="kicker mb-2 block text-muted-foreground"
              >
                Sangrai
              </label>
              <Select
                value={roast ?? ALL}
                onValueChange={(value) =>
                  updateSearch({ roast: value === ALL ? undefined : value })
                }
              >
                <SelectTrigger
                  id="shop-roast"
                  data-ocid="shop.roast_select"
                  className="h-10 w-full rounded-full sm:w-44"
                >
                  <SelectValue placeholder="Semua sangrai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Semua sangrai</SelectItem>
                  {ROAST_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="shop-origin"
                className="kicker mb-2 block text-muted-foreground"
              >
                Asal
              </label>
              <Select
                value={origin ?? ALL}
                onValueChange={(value) =>
                  updateSearch({ origin: value === ALL ? undefined : value })
                }
              >
                <SelectTrigger
                  id="shop-origin"
                  data-ocid="shop.origin_select"
                  className="h-10 w-full rounded-full sm:w-44"
                >
                  <SelectValue placeholder="Semua asal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Semua asal</SelectItem>
                  {originOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="shop-sort"
                className="kicker mb-2 block text-muted-foreground"
              >
                Urutkan
              </label>
              <Select
                value={sort ?? ALL}
                onValueChange={(value) =>
                  updateSearch({ sort: value === ALL ? undefined : value })
                }
              >
                <SelectTrigger
                  id="shop-sort"
                  data-ocid="shop.sort_select"
                  className="h-10 w-full rounded-full sm:w-44"
                >
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Default</SelectItem>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="container flex items-center justify-between gap-4 border-t border-border py-3">
            <p className="spec-label text-muted-foreground">
              {products.length} hasil
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              data-ocid="shop.clear_filters_button"
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Hapus filter
            </Button>
          </div>
        )}
      </section>

      {/* Results */}
      <section className="container py-12 md:py-16">
        {isLoading ? (
          <div data-ocid="shop.loading_state">
            <GridSkeleton />
          </div>
        ) : isError ? (
          <div
            data-ocid="shop.error_state"
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center"
          >
            <SlidersHorizontal
              className="h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="font-display text-xl font-semibold text-foreground">
              Katalog tidak dapat dimuat
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Terjadi kesalahan saat mengambil daftar biji kopi. Coba muat ulang
              halaman.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div
            data-ocid="shop.empty_state"
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-20 text-center"
          >
            <Coffee
              className="h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="font-display text-xl font-semibold text-foreground">
              Tidak ada biji kopi yang cocok
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Coba ubah kata kunci pencarian atau hapus filter untuk melihat
              seluruh koleksi.
            </p>
            {hasActiveFilters && (
              <Button
                type="button"
                onClick={clearFilters}
                data-ocid="shop.empty_state_button"
                className="mt-2 rounded-full"
              >
                Hapus filter
              </Button>
            )}
          </div>
        ) : (
          <div
            data-ocid="shop.grid"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {products.map((product) => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
