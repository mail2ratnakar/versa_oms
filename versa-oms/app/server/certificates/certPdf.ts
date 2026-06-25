// Certificate PDF renderer (FRAMEWORK — FR-CERT-PDF-0005). Produces a real PDF credential with an
// embedded QR pointing at the PUBLIC verify page. Pure: no DB/storage here. pdf-lib + qrcode are
// pure-JS (no native deps). The QR encodes ONLY the public verify URL — never PII (skill 10 / P2.10).
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { qrPayload } from "@/server/eval/certificate";

export type CertificatePdfInput = {
  certificate_number: string;
  candidate_name?: string | null;
  olympiad_name?: string | null;
  award?: string | null;
  issued_on?: string | null;
  verification_code: string;
  base_url?: string;
};

const INK = rgb(0.09, 0.11, 0.16);
const MUTED = rgb(0.38, 0.4, 0.45);
const ACCENT = rgb(0.13, 0.4, 0.69);

export async function renderCertificatePdf(input: CertificatePdfInput): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Border
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: ACCENT, borderWidth: 2 });

  const centre = (text: string, y: number, size: number, f = font, color = INK) => {
    const w = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font: f, color });
  };

  centre("VERSA OLYMPIADS", height - 90, 18, bold, ACCENT);
  centre("Certificate of Achievement", height - 140, 30, bold, INK);
  centre("This certifies that", height - 190, 13, font, MUTED);
  centre(input.candidate_name || "—", height - 235, 34, bold, INK);

  const lines: string[] = [];
  if (input.olympiad_name) lines.push(input.olympiad_name);
  if (input.award) lines.push(`Award: ${input.award}`);
  let y = height - 285;
  for (const l of lines) { centre(l, y, 15, font, INK); y -= 26; }

  // Footer: certificate number + verification code (left), QR (right).
  page.drawText(`Certificate No: ${input.certificate_number}`, { x: 60, y: 100, size: 11, font, color: MUTED });
  page.drawText(`Verification code: ${input.verification_code}`, { x: 60, y: 82, size: 11, font, color: MUTED });
  if (input.issued_on) page.drawText(`Issued on: ${input.issued_on}`, { x: 60, y: 64, size: 11, font, color: MUTED });

  const verifyUrl = qrPayload(input.verification_code, input.base_url ?? "");
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 220 });
  const qrPng = await doc.embedPng(Buffer.from(qrDataUrl.split(",")[1], "base64"));
  const qrSize = 110;
  page.drawImage(qrPng, { x: width - 60 - qrSize, y: 56, width: qrSize, height: qrSize });
  page.drawText("Scan to verify", { x: width - 60 - qrSize, y: 44, size: 9, font, color: MUTED });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
