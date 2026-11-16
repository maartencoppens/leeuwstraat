import { GlassWindow } from "@/components/GlassWindow";
import { NewsletterForm } from "@/components/NewsletterForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

// Everything fits on one screen, without scrolling. On large screens the logo moves to the
// top left and the signup to the bottom right, next to the window (Figma: "image 1").
export default function Home() {
  return (
    <div className="relative flex h-svh flex-col overflow-hidden [--floor-h:14svh]">
      <SiteHeader />
      <main className="flex min-h-0 flex-1 flex-col">
        <GlassWindow />
        <div className="relative flex flex-col items-center bg-[linear-gradient(var(--color-night-900),var(--color-night-800)_48px)] px-4 pt-5 lg:h-[var(--floor-h)] lg:pt-0">
          <NewsletterForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
