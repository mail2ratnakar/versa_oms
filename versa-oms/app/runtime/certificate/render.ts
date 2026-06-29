// FROZEN-KERNEL — certificate rendering. Builds a printable HTML certificate for a cert record. The school's
// emblem appears ONLY if that school has consented (school_settings.emblem_on_certificate === "yes" + an emblem_url).
// Served at /api/certificates/:id/render (printable to PDF). Resolves olympiad via result -> participation.
import { db } from "@/runtime/db";

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function renderCertificate(certId: string): Promise<string> {
  const cert = (await db.get("certificates", certId)) as Record<string, any> | null;
  if (!cert) return "<!doctype html><p style='font-family:system-ui;padding:40px'>Certificate not found.</p>";
  const student = cert.student_id ? (await db.get("students", cert.student_id)) as Record<string, any> : null;
  const result = cert.result_id ? (await db.get("results", cert.result_id)) as Record<string, any> : null;
  const school = cert.school_id ? (await db.get("schools", cert.school_id)) as Record<string, any> : null;
  const part = result && result.participation_id ? (await db.get("participations", result.participation_id)) as Record<string, any> : null;
  const oly = part && part.olympiad_id ? (await db.get("olympiads", part.olympiad_id)) as Record<string, any> : null;
  const settings = ((await db.list("school_settings")) as Record<string, any>[]).find((s) => s.school_id === cert.school_id);
  const showEmblem = !!(settings && settings.emblem_on_certificate === "yes" && settings.emblem_url);

  const award = result && result.award_category && result.award_category !== "none" ? String(result.award_category).toUpperCase() : "";
  const rank = result && result.national_rank ? `National Rank ${result.national_rank}` : "";
  const pct = result && result.percentage != null ? `${result.percentage}%` : "";
  const emblem = showEmblem ? `<img src="${esc(settings!.emblem_url)}" alt="school emblem" style="height:62px;object-fit:contain">` : "";

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Certificate ${esc(cert.certificate_number)}</title>
<style>@page{size:A4 landscape;margin:0}body{margin:0;font-family:Georgia,'Times New Roman',serif;color:#2a2342;background:#f4f1fb}
.cert{width:1040px;max-width:96vw;margin:24px auto;background:#fff;border:2px solid #6d28d9;border-radius:14px;padding:46px 60px;box-shadow:0 14px 50px rgba(40,20,80,.12);position:relative}
.cert:before{content:"";position:absolute;inset:14px;border:1px solid #d9cef6;border-radius:8px;pointer-events:none}
.top{display:flex;justify-content:space-between;align-items:center}.brand{font-weight:800;letter-spacing:.04em;color:#6d28d9;font-size:20px}
h1{text-align:center;font-size:34px;letter-spacing:.02em;margin:26px 0 6px}.sub{text-align:center;color:#7a72a0;margin:0 0 24px;text-transform:uppercase;letter-spacing:.18em;font-size:12px}
.name{text-align:center;font-size:30px;font-weight:800;color:#4c1d95;margin:18px 0 4px}.line{text-align:center;font-size:15px;color:#3a3458;line-height:1.7}
.award{text-align:center;margin:18px 0}.chip{display:inline-block;background:#f0e9ff;color:#6d28d9;border:1px solid #d9cef6;border-radius:999px;padding:7px 16px;font-weight:700;font-size:14px;margin:0 4px}
.foot{display:flex;justify-content:space-between;align-items:flex-end;margin-top:34px;font-size:12px;color:#7a72a0}.verify{font-family:monospace}</style></head>
<body><div class="cert">
  <div class="top"><div class="brand">Versa Olympiads</div><div>${emblem}</div></div>
  <h1>Certificate of Achievement</h1>
  <p class="sub">${esc(cert.certificate_type || "Participation")}</p>
  <p class="line">This is to certify that</p>
  <div class="name">${esc(student && student.student_name || "—")}</div>
  <p class="line">of <b>${esc(school && school.name || "—")}</b></p>
  <p class="line">for outstanding performance in <b>${esc(oly && oly.name || "the Olympiad")}</b>${oly && oly.academic_year ? ` (${esc(oly.academic_year)})` : ""}</p>
  <div class="award">${award ? `<span class="chip">${esc(award)}</span>` : ""}${rank ? `<span class="chip">${esc(rank)}</span>` : ""}${pct ? `<span class="chip">${esc(pct)}</span>` : ""}</div>
  <div class="foot"><div>Issued: ${esc((cert.issued_at || "").slice(0, 10) || "—")}</div><div>Verify at versa…/verify · <span class="verify">${esc(cert.verification_code)}</span></div></div>
</div></body></html>`;
}
