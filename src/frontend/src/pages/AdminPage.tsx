import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { ExternalBlob } from "@caffeineai/object-storage";
import {
  Check,
  Coffee,
  ImagePlus,
  Loader2,
  LogIn,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  Order,
  OrderStatus,
  Product,
  ProductId,
  RoastLevel,
  WeightOption,
} from "../backend";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  useCreateProduct,
  useDeleteOrder,
  useDeleteProduct,
  useIsCallerAdmin,
  useListOrders,
  useListProducts,
  useSetOrderStatus,
  useSetProductStock,
  useUpdateProduct,
} from "../hooks/useQueries";
import { formatIDR, safeImageUrl } from "../store/cart";

/* ---------------------------------------------------------------------------
   Constants
--------------------------------------------------------------------------- */

const ROAST_LEVELS: { value: RoastLevel; label: string }[] = [
  { value: "light" as RoastLevel, label: "Light" },
  { value: "medium" as RoastLevel, label: "Medium" },
  { value: "mediumDark" as RoastLevel, label: "Medium Dark" },
  { value: "dark" as RoastLevel, label: "Dark" },
];

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "new" as OrderStatus, label: "New" },
  { value: "confirmed" as OrderStatus, label: "Confirmed" },
  { value: "completed" as OrderStatus, label: "Completed" },
];

const STATUS_STYLES: Record<string, string> = {
  new: "bg-primary/12 text-primary border-primary/30",
  confirmed: "bg-warning/15 text-warning border-warning/40",
  completed: "bg-accent/15 text-accent border-accent/40",
};

const ROAST_STYLES: Record<string, string> = {
  light: "bg-secondary text-secondary-foreground",
  medium: "bg-secondary text-secondary-foreground",
  mediumDark: "bg-foreground/10 text-foreground",
  dark: "bg-foreground text-background",
};

/* ---------------------------------------------------------------------------
   Helpers
--------------------------------------------------------------------------- */

function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatOrderDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface WeightRow extends WeightOption {
  key: string;
}

interface ProductDraft {
  name: string;
  slug: string;
  description: string;
  tastingNotes: string;
  roastLevel: RoastLevel;
  origin: string;
  weightOptions: WeightRow[];
  inStock: boolean;
  featured: boolean;
  image: ExternalBlob | null;
}

let weightRowSeq = 0;
function nextWeightKey(): string {
  weightRowSeq += 1;
  return `weight-row-${weightRowSeq}`;
}

// A non-empty placeholder URL used only when an existing product has no image.
// Never use ExternalBlob.fromURL("") — an empty blob hash throws
// "Hash must not be empty" when the product is serialized.
const PLACEHOLDER_IMAGE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E";

function emptyDraft(): ProductDraft {
  return {
    name: "",
    slug: "",
    description: "",
    tastingNotes: "",
    roastLevel: "medium" as RoastLevel,
    origin: "",
    weightOptions: [{ key: nextWeightKey(), weight: "200g", price: 0n }],
    inStock: true,
    featured: false,
    image: null,
  };
}

function draftFromProduct(product: Product): ProductDraft {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    tastingNotes: product.tastingNotes.join(", "),
    roastLevel: product.roastLevel,
    origin: product.origin,
    weightOptions:
      product.weightOptions.length > 0
        ? product.weightOptions.map((option) => ({
            key: nextWeightKey(),
            ...option,
          }))
        : [{ key: nextWeightKey(), weight: "200g", price: 0n }],
    inStock: product.inStock,
    featured: product.featured,
    image: product.image,
  };
}

/* ---------------------------------------------------------------------------
   Sign-in gate
--------------------------------------------------------------------------- */

function AdminSignIn() {
  const { login, isInitializing, isLoggingIn } = useInternetIdentity();

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-20">
      <div
        data-ocid="admin.signin_panel"
        className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-subtle"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/12 text-primary">
          <Coffee className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="kicker mt-6 text-muted-foreground">Admin access</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Masuk sebagai admin
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Halaman ini hanya untuk pengelola Cake N C offe. Masuk dengan Internet
          Identity untuk mengelola produk dan pesanan.
        </p>
        <Button
          type="button"
          data-ocid="admin.signin_button"
          onClick={() => login()}
          disabled={isInitializing || isLoggingIn}
          className="mt-6 h-11 w-full rounded-full text-sm font-semibold"
        >
          {isInitializing || isLoggingIn ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogIn className="h-4 w-4" aria-hidden="true" />
          )}
          {isInitializing
            ? "Menyiapkan…"
            : isLoggingIn
              ? "Menunggu masuk…"
              : "Masuk dengan Internet Identity"}
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Product form
--------------------------------------------------------------------------- */

interface ProductFormProps {
  initial: ProductDraft;
  editingId: ProductId | null;
  onCancel: () => void;
  onSaved: () => void;
}

function ProductForm({
  initial,
  editingId,
  onCancel,
  onSaved,
}: ProductFormProps) {
  const [draft, setDraft] = useState<ProductDraft>(initial);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const isPending = createProduct.isPending || updateProduct.isPending;
  const canSubmit =
    draft.name.trim().length > 0 &&
    draft.slug.trim().length > 0 &&
    (editingId !== null || draft.image !== null) &&
    draft.weightOptions.length > 0 &&
    draft.weightOptions.every(
      (option) => option.weight.trim().length > 0 && option.price > 0n,
    );

  const update = <K extends keyof ProductDraft>(
    key: K,
    value: ProductDraft[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  const handleImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(
        bytes,
        file.type,
        file.name,
      ).withUploadProgress((pct) => setUploadProgress(pct));
      update("image", blob);
      toast.success("Gambar siap diunggah bersama produk.");
    } catch {
      toast.error("Gagal membaca gambar. Coba file lain.");
    } finally {
      setUploading(false);
    }
  };

  const handleWeightChange = (
    index: number,
    key: keyof WeightOption,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      weightOptions: current.weightOptions.map((option, i) => {
        if (i !== index) return option;
        if (key === "price") {
          const parsed = Number.parseInt(value.replace(/[^0-9]/g, ""), 10);
          return {
            ...option,
            price: BigInt(Number.isNaN(parsed) ? 0 : parsed),
          };
        }
        return { ...option, weight: value };
      }),
    }));
  };

  const addWeightOption = () =>
    setDraft((current) => ({
      ...current,
      weightOptions: [
        ...current.weightOptions,
        { key: nextWeightKey(), weight: "", price: 0n },
      ],
    }));

  const removeWeightOption = (index: number) =>
    setDraft((current) => ({
      ...current,
      weightOptions: current.weightOptions.filter((_, i) => i !== index),
    }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || isPending) return;

    const product: Product = {
      id: editingId ?? 0n,
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      description: draft.description.trim(),
      tastingNotes: draft.tastingNotes
        .split(",")
        .map((note) => note.trim())
        .filter((note) => note.length > 0),
      roastLevel: draft.roastLevel,
      origin: draft.origin.trim(),
      weightOptions: draft.weightOptions.map((option) => ({
        weight: option.weight.trim(),
        price: option.price,
      })),
      inStock: draft.inStock,
      featured: draft.featured,
      image: draft.image ?? ExternalBlob.fromURL(PLACEHOLDER_IMAGE_URL),
    };

    const mutation = editingId === null ? createProduct : updateProduct;
    mutation.mutate(product, {
      onSuccess: () => {
        toast.success(
          editingId === null ? "Produk ditambahkan." : "Produk diperbarui.",
        );
        onSaved();
      },
      onError: () => toast.error("Gagal menyimpan produk. Coba lagi."),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="admin.product_form"
      className="rounded-lg border border-border bg-card p-6 shadow-subtle"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-xl font-semibold tracking-tight">
          {editingId === null ? "Produk baru" : "Ubah produk"}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-ocid="admin.product_form.close_button"
          aria-label="Tutup formulir"
          onClick={onCancel}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="product-name">Nama</Label>
          <Input
            id="product-name"
            data-ocid="admin.product_form.name_input"
            value={draft.name}
            onChange={(event) => {
              const name = event.target.value;
              setDraft((current) => ({
                ...current,
                name,
                slug:
                  editingId === null && current.slug === slugify(current.name)
                    ? slugify(name)
                    : current.slug,
              }));
            }}
            placeholder="Biji kopi, Fraunces"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-slug">Slug</Label>
          <Input
            id="product-slug"
            data-ocid="admin.product_form.slug_input"
            value={draft.slug}
            onChange={(event) => update("slug", slugify(event.target.value))}
            placeholder="biji-kopi-fraunces"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-origin">Asal</Label>
          <Input
            id="product-origin"
            data-ocid="admin.product_form.origin_input"
            value={draft.origin}
            onChange={(event) => update("origin", event.target.value)}
            placeholder="Gromania"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-roast">Tingkat sangrai</Label>
          <select
            id="product-roast"
            data-ocid="admin.product_form.roast_select"
            value={draft.roastLevel}
            onChange={(event) =>
              update("roastLevel", event.target.value as RoastLevel)
            }
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            {ROAST_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="product-tasting">
            Tasting notes (pisahkan dengan koma)
          </Label>
          <Input
            id="product-tasting"
            data-ocid="admin.product_form.tasting_input"
            value={draft.tastingNotes}
            onChange={(event) => update("tastingNotes", event.target.value)}
            placeholder="Cokelat, jeruk manis, karamel"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="product-description">Deskripsi</Label>
          <Textarea
            id="product-description"
            data-ocid="admin.product_form.description_textarea"
            value={draft.description}
            onChange={(event) => update("description", event.target.value)}
            rows={3}
            placeholder="Ceritakan profil rasa dan proses sangrai biji kopi ini."
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label>Opsi berat &amp; harga</Label>
          <div className="space-y-2">
            {draft.weightOptions.map((option, index) => (
              <div key={option.key} className="flex items-center gap-2">
                <Input
                  data-ocid={`admin.product_form.weight_input.${index + 1}`}
                  value={option.weight}
                  onChange={(event) =>
                    handleWeightChange(index, "weight", event.target.value)
                  }
                  placeholder="200g"
                  className="max-w-[8rem]"
                  aria-label={`Berat opsi ${index + 1}`}
                />
                <Input
                  data-ocid={`admin.product_form.price_input.${index + 1}`}
                  value={option.price === 0n ? "" : option.price.toString()}
                  onChange={(event) =>
                    handleWeightChange(index, "price", event.target.value)
                  }
                  inputMode="numeric"
                  placeholder="145000"
                  aria-label={`Harga opsi ${index + 1} dalam rupiah`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-ocid={`admin.product_form.remove_weight_button.${index + 1}`}
                  aria-label={`Hapus opsi berat ${index + 1}`}
                  onClick={() => removeWeightOption(index)}
                  disabled={draft.weightOptions.length <= 1}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="admin.product_form.add_weight_button"
            onClick={addWeightOption}
            className="rounded-full"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah opsi berat
          </Button>
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label htmlFor="product-image">Gambar produk</Label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
              {safeImageUrl(draft.image) ? (
                <img
                  src={safeImageUrl(draft.image) ?? ""}
                  alt="Pratinjau produk"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus
                  className="h-6 w-6 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <label
                htmlFor="product-image"
                data-ocid="admin.product_form.upload_button"
                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                {uploading ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                )}
                {uploading ? `Mengunggah ${uploadProgress}%` : "Pilih gambar"}
              </label>
              <input
                id="product-image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleImage(event.target.files?.[0])}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                JPG, PNG, atau WebP. Gambar diunggah saat produk disimpan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              data-ocid="admin.product_form.instock_checkbox"
              checked={draft.inStock}
              onChange={(event) => update("inStock", event.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            Stok tersedia
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              data-ocid="admin.product_form.featured_checkbox"
              checked={draft.featured}
              onChange={(event) => update("featured", event.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            Tampilkan sebagai unggulan
          </label>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          data-ocid="admin.product_form.cancel_button"
          onClick={onCancel}
          className="rounded-full"
        >
          Batal
        </Button>
        <Button
          type="submit"
          data-ocid="admin.product_form.submit_button"
          disabled={!canSubmit || isPending || uploading}
          className="rounded-full"
        >
          {isPending && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {editingId === null ? "Tambah produk" : "Simpan perubahan"}
        </Button>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------------------
   Products section
--------------------------------------------------------------------------- */

function ProductsSection() {
  const { data: products = [], isLoading } = useListProducts();
  const setStock = useSetProductStock();
  const deleteProduct = useDeleteProduct();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = (product: Product) => {
    if (!window.confirm(`Hapus produk "${product.name}"?`)) return;
    deleteProduct.mutate(product.id, {
      onSuccess: () => toast.success("Produk dihapus."),
      onError: () => toast.error("Gagal menghapus produk."),
    });
  };

  const handleStock = (product: Product) => {
    setStock.mutate(
      { id: product.id, inStock: !product.inStock },
      {
        onSuccess: () =>
          toast.success(
            product.inStock ? "Ditandai habis." : "Ditandai tersedia.",
          ),
        onError: () => toast.error("Gagal memperbarui stok."),
      },
    );
  };

  return (
    <section data-ocid="admin.products_section" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker text-muted-foreground">Katalog</p>
          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Produk
          </h2>
        </div>
        <Button
          type="button"
          data-ocid="admin.products_section.add_button"
          onClick={openCreate}
          className="rounded-full"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Produk baru
        </Button>
      </div>

      {formOpen && (
        <ProductForm
          key={editing ? editing.id.toString() : "new"}
          initial={editing ? draftFromProduct(editing) : emptyDraft()}
          editingId={editing ? editing.id : null}
          onCancel={closeForm}
          onSaved={closeForm}
        />
      )}

      {isLoading ? (
        <div
          data-ocid="admin.products_section.loading_state"
          className="space-y-3"
        >
          {Array.from({ length: 3 }, (_, i) => `product-skeleton-${i}`).map(
            (id) => (
              <div
                key={id}
                className="h-20 animate-pulse rounded-lg border border-border bg-muted/50"
              />
            ),
          )}
        </div>
      ) : products.length === 0 ? (
        <div
          data-ocid="admin.products_section.empty_state"
          className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-14 text-center"
        >
          <Package
            className="mx-auto h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-4 font-display text-lg font-semibold">
            Belum ada produk
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tambahkan biji kopi pertama untuk mulai berjualan.
          </p>
          <Button
            type="button"
            data-ocid="admin.products_section.empty_add_button"
            onClick={openCreate}
            className="mt-5 rounded-full"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Produk baru
          </Button>
        </div>
      ) : (
        <ul data-ocid="admin.products_section.list" className="space-y-3">
          {products.map((product, index) => (
            <li
              key={product.id.toString()}
              data-ocid={`admin.products_section.item.${index + 1}`}
              className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-subtle"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                {safeImageUrl(product.image) ? (
                  <img
                    src={safeImageUrl(product.image) ?? ""}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Coffee
                    className="h-6 w-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-display text-lg font-semibold tracking-tight">
                    {product.name}
                  </h3>
                  <span
                    className={`spec-label rounded-full px-2 py-0.5 ${
                      ROAST_STYLES[product.roastLevel] ?? "bg-secondary"
                    }`}
                  >
                    {product.roastLevel}
                  </span>
                  {product.featured && (
                    <span className="spec-label rounded-full border border-primary/30 bg-primary/12 px-2 py-0.5 text-primary">
                      Unggulan
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {product.origin || "Asal belum diisi"} ·{" "}
                  {product.weightOptions
                    .map(
                      (option) =>
                        `${option.weight} ${formatIDR(Number(option.price))}`,
                    )
                    .join(" · ")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-ocid={`admin.products_section.stock_toggle.${index + 1}`}
                  onClick={() => handleStock(product)}
                  disabled={setStock.isPending}
                  aria-pressed={product.inStock}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${
                    product.inStock
                      ? "border-accent/40 bg-accent/15 text-accent"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      product.inStock ? "bg-accent" : "bg-muted-foreground"
                    }`}
                    aria-hidden="true"
                  />
                  {product.inStock ? "Tersedia" : "Habis"}
                </button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  data-ocid={`admin.products_section.edit_button.${index + 1}`}
                  aria-label={`Ubah ${product.name}`}
                  onClick={() => openEdit(product)}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  data-ocid={`admin.products_section.delete_button.${index + 1}`}
                  aria-label={`Hapus ${product.name}`}
                  onClick={() => handleDelete(product)}
                  disabled={deleteProduct.isPending}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Orders section
--------------------------------------------------------------------------- */

function OrdersSection() {
  const { data: orders = [], isLoading } = useListOrders(true);
  const setStatus = useSetOrderStatus();
  const deleteOrder = useDeleteOrder();

  const sorted = useMemo(
    () =>
      [...orders].sort((a, b) =>
        a.createdAt === b.createdAt
          ? Number(b.id - a.id)
          : Number(b.createdAt - a.createdAt),
      ),
    [orders],
  );

  const handleStatus = (order: Order, status: OrderStatus) => {
    setStatus.mutate(
      { id: order.id, status },
      {
        onSuccess: () =>
          toast.success(`Pesanan ${order.reference} diperbarui.`),
        onError: () => toast.error("Gagal memperbarui status pesanan."),
      },
    );
  };

  const handleDelete = (order: Order) => {
    if (!window.confirm(`Hapus pesanan ${order.reference}?`)) return;
    deleteOrder.mutate(order.id, {
      onSuccess: () => toast.success("Pesanan dihapus."),
      onError: () => toast.error("Gagal menghapus pesanan."),
    });
  };

  return (
    <section data-ocid="admin.orders_section" className="space-y-5">
      <div>
        <p className="kicker text-muted-foreground">Kotak masuk</p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          Pesanan
        </h2>
      </div>

      {isLoading ? (
        <div
          data-ocid="admin.orders_section.loading_state"
          className="space-y-3"
        >
          {Array.from({ length: 3 }, (_, i) => `order-skeleton-${i}`).map(
            (id) => (
              <div
                key={id}
                className="h-32 animate-pulse rounded-lg border border-border bg-muted/50"
              />
            ),
          )}
        </div>
      ) : sorted.length === 0 ? (
        <div
          data-ocid="admin.orders_section.empty_state"
          className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-14 text-center"
        >
          <Package
            className="mx-auto h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-4 font-display text-lg font-semibold">
            Belum ada pesanan
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pesanan baru dari pelanggan akan muncul di sini.
          </p>
        </div>
      ) : (
        <ul data-ocid="admin.orders_section.list" className="space-y-4">
          {sorted.map((order, index) => (
            <li
              key={order.id.toString()}
              data-ocid={`admin.orders_section.item.${index + 1}`}
              className="rounded-lg border border-border bg-card p-5 shadow-subtle"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="spec-label text-foreground">
                      {order.reference}
                    </span>
                    <span
                      className={`spec-label rounded-full border px-2 py-0.5 ${
                        STATUS_STYLES[order.status] ?? "border-border bg-muted"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="spec-label text-muted-foreground">Total</p>
                  <p className="font-display text-xl font-semibold tracking-tight">
                    {formatIDR(Number(order.total))}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-foreground">
                    {order.customerName}
                  </p>
                  <p className="text-muted-foreground">{order.phone}</p>
                  <p className="break-words text-muted-foreground">
                    {order.email}
                  </p>
                  <p className="break-words text-muted-foreground">
                    {order.address}
                  </p>
                  {order.notes && (
                    <p className="mt-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                      Catatan: {order.notes}
                    </p>
                  )}
                </div>

                <ul className="space-y-2">
                  {order.items.map((item, itemIndex) => (
                    <li
                      key={`${order.id.toString()}-${itemIndex}`}
                      className="flex items-baseline justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {item.productName}
                        </span>
                        <span className="spec-label text-muted-foreground">
                          {item.weight} × {item.quantity.toString()} ·{" "}
                          {formatIDR(Number(item.unitPrice))}
                        </span>
                      </span>
                      <span className="spec-label shrink-0 text-foreground">
                        {formatIDR(Number(item.lineTotal))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      data-ocid={`admin.orders_section.status_${status.value}_button.${index + 1}`}
                      onClick={() => handleStatus(order, status.value)}
                      disabled={
                        setStatus.isPending || order.status === status.value
                      }
                      aria-pressed={order.status === status.value}
                      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors disabled:opacity-60 ${
                        order.status === status.value
                          ? STATUS_STYLES[status.value]
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {order.status === status.value && (
                        <Check className="h-3 w-3" aria-hidden="true" />
                      )}
                      {status.label}
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-ocid={`admin.orders_section.delete_button.${index + 1}`}
                  onClick={() => handleDelete(order)}
                  disabled={deleteOrder.isPending}
                  className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Hapus
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Page
--------------------------------------------------------------------------- */

export default function AdminPage() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const { data: isAdmin = false, isLoading: adminLoading } = useIsCallerAdmin();

  if (isInitializing) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="container flex min-h-[60vh] items-center justify-center py-20"
      >
        <Loader2
          className="h-6 w-6 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (!isAuthenticated || (!adminLoading && !isAdmin)) {
    return <AdminSignIn />;
  }

  if (adminLoading) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="container flex min-h-[60vh] items-center justify-center py-20"
      >
        <Loader2
          className="h-6 w-6 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div data-ocid="admin.page" className="container py-12 md:py-16">
      <header className="border-b border-border pb-8">
        <p className="kicker text-muted-foreground">Ruang pengelola</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Admin
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Kelola katalog biji kopi dan pantau pesanan yang masuk dari pelanggan.
        </p>
      </header>

      <div className="mt-10 space-y-14">
        <ProductsSection />
        <OrdersSection />
      </div>
    </div>
  );
}
