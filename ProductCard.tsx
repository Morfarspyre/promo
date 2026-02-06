import React, { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: string;
  buyUrl: string;
  imageUrl: string;
};

interface ProductCardProps {
  rotationMs?: number;
  products?: Product[];
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "summagon-multiplikation",
    name: "Summagon Multiplikation",
    price: "299 kr",
    buyUrl: "https://summagon.se/produkt/summagonmultiplikation/",
    imageUrl: "/promo/assets/summagon-multiplikation.png",
  },
];

function normalizeUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function ProductCard({ rotationMs = 5000, products }: ProductCardProps) {
  const items = useMemo(
    () => (products && products.length ? products : DEFAULT_PRODUCTS),
    [products]
  );

  const [index, setIndex] = useState(0);
  const [imgOk, setImgOk] = useState(true);

  const active = items[index];

  useEffect(() => {
    if (items.length < 2) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, rotationMs);

    return () => clearInterval(timer);
  }, [items.length, rotationMs]);

  useEffect(() => {
    setImgOk(true);
  }, [active?.id]);

  if (!active) return null;

  const imageSrc = normalizeUrl(active.imageUrl);
  const isMicrosoftStore = active.buyUrl.includes("apps.microsoft.com");
  const ctaText = isMicrosoftStore ? "Öppna i Microsoft Store" : "Köp";

  return (
    <div className="mt-6 rounded-lg border border-border bg-background p-4">
      <div className="flex gap-4">
        <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
          {imgOk ? (
            <img
              src={imageSrc}
              alt={active.name}
              className="w-full h-full object-cover"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground px-2 text-center">
              Bild saknas
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
            {active.name}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">{active.price}</p>

          <a
            href={active.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            style={{
              backgroundColor: "#C24D17",
              color: "#ffffff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(0.95)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "";
            }}
          >
            {ctaText}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
        Om du är intresserad av analoga spel eller enkla verktyg för skolan och
        småföretag, hittar du mer på Summagon.se.
      </p>

      {items.length > 1 && (
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {items.map((p, i) => (
            <span
              key={p.id}
              className={[
                "h-1.5 w-1.5 rounded-full border border-foreground/40",
                i === index ? "bg-foreground/70" : "bg-transparent",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
