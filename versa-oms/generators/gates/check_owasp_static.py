#!/usr/bin/env python3
"""GATE check_owasp_static — static security checks on EVERY build (source-driven, no server needed).

HARD: no hardcoded secret signatures in source/app · the source-declared security headers are present.
REPORT: input-validation coverage (canonical) · the auth-last DEFERRED list (tracked, lights up with auth).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SEC = ROOT / "source-of-truth" / "v2_supplement" / "security.json"
DM = ROOT / "spec" / "derived" / "data_model.json"

SECRET_SIGS = [r"xkeysib-[A-Za-z0-9]{10}", r"sk-[A-Za-z0-9]{20}", r"AKIA[0-9A-Z]{16}",
               r"-----BEGIN [A-Z ]*PRIVATE KEY-----", r"ghp_[A-Za-z0-9]{20}", r"AIza[0-9A-Za-z_\-]{30}"]
SCAN_DIRS = ["source-of-truth", "spec", "app", "generators"]
SKIP = ("node_modules", "/.env", "/.git/", "dist/", "package-lock", "yarn.lock", "BUILD_MANIFEST")


def main():
    fails, sec = [], json.loads(SEC.read_text(encoding="utf-8"))

    rx = re.compile("|".join(SECRET_SIGS))
    for d in SCAN_DIRS:
        for p in (ROOT / d).rglob("*"):
            if not p.is_file() or any(s in p.as_posix() for s in SKIP):
                continue
            if p.suffix.lower() in (".png", ".jpg", ".jpeg", ".ico", ".woff", ".woff2", ".sqlite"):
                continue
            try:
                if rx.search(p.read_text(encoding="utf-8", errors="ignore")):
                    fails.append(f"hardcoded secret signature in {p.relative_to(ROOT)}")
            except OSError:
                continue

    need = ["X-Content-Type-Options", "X-Frame-Options", "Content-Security-Policy", "Referrer-Policy"]
    miss_h = [h for h in need if h not in (sec.get("headers") or {})]
    if miss_h:
        fails.append(f"security headers not declared in source: {miss_h}")

    # report-only: input-validation coverage
    entities = json.loads(DM.read_text(encoding="utf-8")).get("entities", {})
    tot = cov = 0
    for e, dd in entities.items():
        for f in dd.get("fields", []):
            if f.get("primary_key") or f["name"].endswith(("_at", "_by")):
                continue
            tot += 1
            cov += 1 if (f.get("rule") or "").strip() else 0
    print(f"  input-validation coverage: {cov}/{tot} user fields carry a rule")
    print(f"  deferred to auth-last: {len(sec.get('deferred_auth_last', []))} items (tracked in security.json + memory)")

    for f in fails:
        print(f"  FAIL {f}")
    if fails:
        print(f"check_owasp_static: FAIL — {len(fails)} issue(s)")
        return 1
    print("check_owasp_static: PASS — no secrets in source, security headers declared")
    return 0


if __name__ == "__main__":
    sys.exit(main())
