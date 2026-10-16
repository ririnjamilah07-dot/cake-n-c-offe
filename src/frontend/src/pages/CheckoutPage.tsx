import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShoppingBag } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useCreateOrder } from "../hooks/useQueries";
import {
  cartTotal,
  formatIDR,
  lineSubtotal,
  useCartStore,
} from "../store/cart";

interface FormState {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  customerName: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const createOrder = useCreateOrder();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [reference, setReference] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const total = cartTotal(items);

  const setField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!form.customerName.trim()) next.customerName = "Name is required";
    if (!form.phone.trim()) next.phone = "Phone number is required";
    if (!form.address.trim()) next.address = "Delivery address is required";
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address";
    }
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    if (items.length === 0) return;

    const payload = {
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      notes: form.notes.trim(),
      items: items.map((line) => ({
        productId: line.productId,
        productName: line.name,
        weight: line.weight,
        quantity: BigInt(line.quantity),
        unitPrice: BigInt(line.unitPrice),
        lineTotal: BigInt(lineSubtotal(line)),
      })),
    };

    createOrder.mutate(payload, {
      onSuccess: (order) => {
        setReference(order.reference);
        setForm(EMPTY_FORM);
        clear();
      },
      onError: () => {
        setSubmitError(
          "We couldn't place your order. Please check your details and try again.",
        );
      },
    });
  };

  if (reference) {
    return (
      <div className="container py-20 md:py-28">
        <div
          data-ocid="checkout.success_state"
          className="mx-auto flex max-w-lg flex-col items-center rounded-xl border border-border bg-card px-8 py-16 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </span>
          <p className="kicker mt-6 text-muted-foreground">Pesanan diterima</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            Thank you for your order
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Kami akan menghubungi kamu untuk konfirmasi. Simpan nomor referensi
            pesanan di bawah ini.
          </p>
          <div className="mt-6 w-full rounded-lg border border-border bg-secondary px-5 py-4">
            <p className="kicker text-muted-foreground">Order reference</p>
            <p
              data-ocid="checkout.reference"
              className="spec-label mt-2 text-2xl font-semibold tracking-wide text-foreground"
            >
              {reference}
            </p>
          </div>
          <Button
            asChild
            data-ocid="checkout.continue_shopping_button"
            className="mt-8 rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/shop" search={{}}>
              Continue shopping
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 md:py-28">
        <div
          data-ocid="checkout.empty_state"
          className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-border bg-card px-8 py-16 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <ShoppingBag className="h-7 w-7" aria-hidden="true" />
          </span>
          <p className="kicker mt-6 text-muted-foreground">Keranjang kosong</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
            Nothing to check out
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Tambahkan biji kopi ke keranjang sebelum melanjutkan ke pembayaran.
          </p>
          <Button
            asChild
            data-ocid="checkout.shop_link"
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
        <p className="kicker text-muted-foreground">Pembayaran</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Checkout
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Isi detail pengiriman dan kami akan mengonfirmasi pesananmu.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <form
          onSubmit={handleSubmit}
          noValidate
          data-ocid="checkout.form"
          className="space-y-6"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">
                Full name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customerName"
                data-ocid="checkout.name_input"
                value={form.customerName}
                onChange={(e) => setField("customerName", e.target.value)}
                aria-invalid={!!errors.customerName}
                aria-describedby={
                  errors.customerName ? "customerName-error" : undefined
                }
                placeholder="Nama lengkap"
                autoComplete="name"
              />
              {errors.customerName && (
                <p
                  id="customerName-error"
                  data-ocid="checkout.name_error"
                  className="text-xs font-medium text-destructive"
                >
                  {errors.customerName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                data-ocid="checkout.phone_input"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                placeholder="+62 812 3456 7890"
                autoComplete="tel"
              />
              {errors.phone && (
                <p
                  id="phone-error"
                  data-ocid="checkout.phone_error"
                  className="text-xs font-medium text-destructive"
                >
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              data-ocid="checkout.email_input"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              placeholder="nama@email.com"
              autoComplete="email"
            />
            {errors.email && (
              <p
                id="email-error"
                data-ocid="checkout.email_error"
                className="text-xs font-medium text-destructive"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Delivery address <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="address"
              data-ocid="checkout.address_input"
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? "address-error" : undefined}
              placeholder="Alamat pengiriman lengkap"
              autoComplete="street-address"
              rows={3}
            />
            {errors.address && (
              <p
                id="address-error"
                data-ocid="checkout.address_error"
                className="text-xs font-medium text-destructive"
              >
                {errors.address}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              data-ocid="checkout.notes_input"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Catatan tambahan, mis. waktu pengiriman"
              rows={2}
            />
          </div>

          {submitError && (
            <p
              data-ocid="checkout.error_state"
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
              {submitError}
            </p>
          )}

          <Button
            type="submit"
            data-ocid="checkout.submit_button"
            disabled={createOrder.isPending}
            className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto sm:px-8"
          >
            {createOrder.isPending ? "Placing order…" : "Place order"}
            {!createOrder.isPending && (
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="kicker text-muted-foreground">Order summary</h2>
            <ul data-ocid="checkout.summary_list" className="mt-5 space-y-4">
              {items.map((line, index) => (
                <li
                  key={`${line.productId}-${line.weight}`}
                  data-ocid={`checkout.summary_item.${index + 1}`}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {line.name}
                    </p>
                    <p className="spec-label mt-0.5 text-muted-foreground">
                      {line.weight} × {line.quantity}
                    </p>
                  </div>
                  <span className="spec-label shrink-0 text-foreground">
                    {formatIDR(lineSubtotal(line))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
              <span className="font-display text-lg font-semibold">Total</span>
              <span
                data-ocid="checkout.total"
                className="spec-label text-xl font-semibold text-foreground"
              >
                {formatIDR(total)}
              </span>
            </div>
            <Link
              to="/cart"
              data-ocid="checkout.edit_cart_link"
              className="mt-4 block text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Edit cart
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
