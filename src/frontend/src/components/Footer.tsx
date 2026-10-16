import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useGetBusinessInfo } from "../hooks/useQueries";

export default function Footer() {
  const { data: info } = useGetBusinessInfo();
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="border-t border-border bg-foreground text-background"
    >
      <div className="container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-semibold tracking-tight">
            {info?.name ?? "Cake N C offe"}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-background/70">
            {info?.tagline ??
              "Specialty coffee beans, roasted fresh every week."}
          </p>
        </div>

        <div>
          <h3 className="kicker text-background/60">Address</h3>
          <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-background/85">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{info?.address ?? "22 Karpustan Road, Kataukai, 45705"}</span>
          </p>
        </div>

        <div>
          <h3 className="kicker text-background/60">Opening Hours</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-background/85">
            {(info?.openingHours ?? []).map((entry) => (
              <li key={entry.days} className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  <span className="font-medium">{entry.days}</span>
                  <span className="spec-label ml-2 text-background/70">
                    {entry.hours}
                  </span>
                </span>
              </li>
            ))}
            {(!info || info.openingHours.length === 0) && (
              <li className="text-background/60">Hours coming soon</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="kicker text-background/60">Contact</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-background/85">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              <a
                href={`tel:${info?.phone ?? ""}`}
                className="transition-colors hover:text-primary"
              >
                {info?.phone ?? "+81 (15) 233-3785"}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <a
                href={`mailto:${info?.email ?? ""}`}
                className="transition-colors hover:text-primary"
              >
                {info?.email ?? "info@cakencoffe.com"}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/15">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 text-xs text-background/60 sm:flex-row">
          <p>
            © {year} {info?.name ?? "Cake N C offe"}. All rights reserved.
          </p>
          <p>
            Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-primary"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
