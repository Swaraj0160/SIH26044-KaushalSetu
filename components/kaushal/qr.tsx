import QRCode from "qrcode";

/** Server-rendered QR as an inline SVG string. Real encoding, no external calls. */
export async function Qr({
  text,
  size = 132,
}: {
  text: string;
  size?: number;
}) {
  const svg = await QRCode.toString(text, {
    type: "svg",
    margin: 1,
    width: size,
    color: { dark: "#1f2547", light: "#ffffff00" },
    errorCorrectionLevel: "M",
  });
  return (
    <div
      className="border-border rounded-lg border bg-white p-2"
      style={{ width: size + 16, height: size + 16 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
