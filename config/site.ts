// Public address of the site, used for absolute links such as Open Graph.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lee-uwstraat.be";

// Printed QR codes point to these paths. Each one redirects to the home page with ?src=<name>,
// so visits can be counted per printed piece.
export const QR_SOURCES = ["raam", "poster1", "poster2", "poster3", "poster4", "kids", "onderlegger", "bel"] as const;

// Where the QR code in the projection on the window leads (redirects to /?src=raam).
export const RAAM_URL = "https://lee-uwstraat.be/raam";
