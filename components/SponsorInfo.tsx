import { nl } from "@/content/nl";

const text = nl.sponsors;

// The eye and the handshake come from the design files (public/icons/) and are shown in gold
// through a mask. The people icon is a simple line icon in the same style.
const FILE_ICONS = { eye: "/icons/eye.svg", handshake: "/icons/handshake.svg" };

function Icon({ name }: { name: keyof typeof FILE_ICONS | "people" }) {
  if (name !== "people") {
    const mask = `url("${FILE_ICONS[name]}") center / contain no-repeat`;
    return <span aria-hidden className="size-6 shrink-0 bg-gold-500" style={{ mask, WebkitMask: mask }} />;
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-6 shrink-0 fill-none stroke-gold-500 stroke-[1.4]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16.5 14c2.4 0 4 1.5 4.5 4" />
    </svg>
  );
}

/** Left of the window on large screens: what the festival is and the call to support it. */
export function SponsorIntro({ className = "" }: { className?: string }) {
  return (
    <section className={`flex flex-col gap-5 ${className}`}>
      <p className="flex items-center gap-4 text-label text-gold-500 uppercase">
        {text.eyebrow}
        <span aria-hidden className="h-px w-8 bg-gold-700" />
      </p>
      <h1 className="text-titel-2 text-cream-100 xl:text-titel-1">{text.title}</h1>
      <p className="text-body text-cream-300">{text.intro}</p>
    </section>
  );
}

/** Right of the window on large screens: the three reasons to sponsor. */
export function SponsorReasons({ className = "" }: { className?: string }) {
  return (
    <section className={`flex flex-col gap-5 ${className}`}>
      <h2 className="text-kop-3 text-cream-100">{text.whyTitle}</h2>
      <ul className="flex flex-col gap-5">
        {text.reasons.map((reason) => (
          <li key={reason.title} className="flex gap-4">
            <Icon name={reason.icon} />
            <div className="flex flex-col gap-1">
              <h3 className="text-body font-semibold text-cream-100">{reason.title}</h3>
              <p className="text-klein text-cream-300">{reason.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-klein text-cream-400 italic">{text.note}</p>
    </section>
  );
}

/** The date line at the foot of the page, between two thin rules. */
export function SponsorFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`flex items-center justify-center gap-4 text-label text-cream-400 uppercase ${className}`}>
      <span aria-hidden className="hidden h-px w-12 bg-night-600 sm:block" />
      <span className="text-center">{text.footer}</span>
      <span aria-hidden className="hidden h-px w-12 bg-night-600 sm:block" />
    </footer>
  );
}
