import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useGetBusinessInfo, useListProducts } from "../hooks/useQueries";

const FEATURED_LIMIT = 3;

const SKELETON_IDS = Array.from(
  { length: FEATURED_LIMIT },
  (_, i) => `featured-skeleton-${i}`,
);

export default function HomePage() {
  const { data: products, isLoading } = useListProducts({});
  const { data: info } = useGetBusinessInfo();

  const featured = (products ?? [])
    .filter((product) => product.featured)
    .slice(0, FEATURED_LIMIT);

  return (
    <div data-ocid="home.page">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-subtle">
        <div className="grain absolute inset-0" aria-hidden="true" />
        <div className="container relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-8">
          <div className="max-w-xl">
            <p className="kicker text-primary">Specialty roastery</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Biji kopi, disangrai segar setiap minggu
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              {info?.tagline ??
                "Single-origin beans roasted in small batches, packed within days of the roast and shipped straight to your kitchen."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                data-ocid="home.hero_cta_button"
                className="rounded-full px-7 text-sm font-semibold"
              >
                <Link to="/shop" search={{}}>
                  Shop the beans
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                data-ocid="home.hero_secondary_button"
                className="rounded-full border-border bg-transparent px-7 text-sm font-semibold"
              >
                <Link to="/" hash="about">
                  Our story
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              <img
                src="/assets/generated/hero-coffee-bag.dim_1024x1024.png"
                alt="A bag of Cake N C offe specialty coffee beans with a tangerine label"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="spec-label absolute -bottom-4 left-4 rounded-full border border-border bg-card px-4 py-2 text-foreground shadow-sm sm:left-8">
              Roasted fresh · 200g
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Featured beans                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section
        id="featured"
        data-ocid="home.featured_section"
        className="border-b border-border bg-background"
      >
        <div className="container py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker text-muted-foreground">Katalog</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Featured beans
              </h2>
            </div>
            <Link
              to="/shop"
              search={{}}
              data-ocid="home.view_all_link"
              className="spec-label inline-flex items-center gap-1.5 text-primary transition-colors hover:text-primary/80"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {isLoading ? (
            <div
              data-ocid="home.featured_loading_state"
              className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {SKELETON_IDS.map((id) => (
                <div
                  key={id}
                  className="overflow-hidden rounded-lg border border-border bg-card"
                >
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product, index) => (
                <ProductCard
                  key={product.id.toString()}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div
              data-ocid="home.featured_empty_state"
              className="mt-10 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center"
            >
              <p className="font-display text-xl font-semibold text-foreground">
                Fresh roasts landing soon
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Our next batch is on the cooling tray. Browse the full catalog
                in the meantime.
              </p>
              <Button
                asChild
                className="mt-6 rounded-full px-6 text-sm font-semibold"
              >
                <Link to="/shop" search={{}}>
                  Browse the shop
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Story / about                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section
        id="about"
        data-ocid="home.about_section"
        className="border-b border-border bg-secondary/40"
      >
        <div className="container grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="kicker text-primary">Our story</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              A small roastery with a long memory
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Cake N C offe began with a single drum roaster and a stubborn
                belief that great coffee should taste like the place it grew.
                Every lot we buy is cupped by hand, roasted in small batches,
                and rested just long enough to open up.
              </p>
              <p>
                We work directly with growers, pay above fair-trade rates, and
                print the roast date on every bag — because freshness is the one
                ingredient you cannot fake.
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4">
            {[
              { value: "12", label: "Single origins" },
              { value: "48h", label: "Roast to ship" },
              { value: "100%", label: "Direct trade" },
              { value: "7d", label: "Freshness window" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-card p-5"
              >
                <dt className="spec-label text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Contact                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section
        id="contact"
        data-ocid="home.contact_section"
        className="bg-background"
      >
        <div className="container py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="kicker text-muted-foreground">Visit us</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Come by the roastery
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Drop in for a cupping, pick up a bag, or just say hello. We are
              happy to talk beans.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="kicker mt-4 text-muted-foreground">Address</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {info?.address ?? "22 Karpustan Road, Kataukai, 45705"}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="kicker mt-4 text-muted-foreground">
                Opening hours
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                {(info?.openingHours ?? []).map((entry) => (
                  <li key={entry.days} className="flex flex-col">
                    <span className="font-medium">{entry.days}</span>
                    <span className="spec-label text-muted-foreground">
                      {entry.hours}
                    </span>
                  </li>
                ))}
                {(!info || info.openingHours.length === 0) && (
                  <li className="text-muted-foreground">Hours coming soon</li>
                )}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="kicker mt-4 text-muted-foreground">Contact</h3>
              <ul className="mt-2 space-y-2 text-sm text-foreground">
                <li>
                  <a
                    href={`tel:${info?.phone ?? ""}`}
                    data-ocid="home.contact_phone_link"
                    className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    {info?.phone ?? "+81 (15) 233-3785"}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${info?.email ?? ""}`}
                    data-ocid="home.contact_email_link"
                    className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    {info?.email ?? "info@cakencoffe.com"}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
