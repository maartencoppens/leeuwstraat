import QRCode from "qrcode";

type Props = {
  value: string;
  label: string;
  className?: string;
  /** Light plate and four-module quiet zone around the code. Off when the code sits on a light shard. */
  plate?: boolean;
};

/**
 * A QR code as one SVG path, made while the page is built (no QR code library in the browser).
 * Dark modules on a light plate with a four-module quiet zone: the most reliable combination for
 * phone cameras, also when projected. Error correction Q keeps it readable through the gauze.
 */
export function QrCode({ value, label, className = "", plate = true }: Props) {
  const { modules } = QRCode.create(value, { errorCorrectionLevel: "Q" });
  const size = modules.size;
  const quiet = plate ? 4 : 0;
  let path = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules.get(x, y)) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    }
  }

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${size + 2 * quiet} ${size + 2 * quiet}`}
      shapeRendering="crispEdges"
      className={`block ${plate ? "bg-cream-100" : ""} ${className}`}
    >
      {/* Pure black: no light from the projector, the darkest the modules can be. */}
      <path d={path} fill="#000" />
    </svg>
  );
}
