import { nl } from "@/content/nl";

/** One line at the foot of the page: the festival date, then the links, separated by dots. */
export function SiteFooter() {
  const items = [{ label: nl.footer.date }, ...nl.footer.links];

  return (
    <footer className="z-10 bg-night-800 px-4 pt-2 pb-[max(var(--spacing-3),env(safe-area-inset-bottom))] text-center text-klein text-cream-200 lg:absolute lg:inset-x-0 lg:bottom-0 lg:bg-transparent lg:pb-4">
      <ul className="flex flex-wrap items-center justify-center gap-y-1">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center">
            {index > 0 && (
              <span aria-hidden className="px-3 text-gold-500">
                ·
              </span>
            )}
            {"href" in item ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-6 items-center underline decoration-cream-200/40 underline-offset-4 transition-colors hover:text-cream-100 hover:decoration-cream-100"
              >
                {item.label}
              </a>
            ) : (
              <span className="inline-flex min-h-6 items-center">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </footer>
  );
}
