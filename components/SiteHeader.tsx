import Image from "next/image";
import Link from "next/link";
import { nl } from "@/content/nl";
import logo from "@/public/brand/logo-horizontaal.svg";

/** On the home page the logo is the page heading; elsewhere it links back home. */
export function SiteHeader({ home = true }: { home?: boolean }) {
  const image = <Image src={logo} alt={nl.header.logoAlt} priority className="h-auto w-[220px] lg:w-[300px]" />;
  return (
    <header className="relative z-10 flex justify-center px-4 pt-4 lg:absolute lg:top-6 lg:left-7 lg:p-0">
      {home ? <h1 className="m-0">{image}</h1> : <Link href="/">{image}</Link>}
    </header>
  );
}
