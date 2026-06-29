#!/usr/bin/env python3
"""GATE security_probe — dynamic OWASP-style probes against the RUNNING app, every build.

Auth-independent set (we wire auth LAST): security headers · input-validation 422 · upload XSS hardening ·
rate-limit. Self-starts the dev server if one isn't already up. AUTH probes (IDOR, auth-bypass, RBAC, CSRF) are
DEFERRED — they light up when auth lands (tracked in security.json + memory).
"""
import base64
import json
import shutil
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PORT = 3400
BASE = f"http://localhost:{PORT}"


def up():
    try:
        with socket.create_connection(("localhost", PORT), 1):
            return True
    except OSError:
        return False


def http(path, method="GET", body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method, headers={"content-type": "application/json"})
    try:
        r = urllib.request.urlopen(req, timeout=8)
        return r.status, {k.lower(): v for k, v in r.headers.items()}, r.read()
    except urllib.error.HTTPError as e:
        return e.code, {k.lower(): v for k, v in e.headers.items()}, e.read()


def probes():
    fails = []
    # 1 — security headers present on a normal page
    st, h, _ = http("/staff/OJ-O3.html")
    for need in ("x-content-type-options", "x-frame-options", "content-security-policy"):
        if need not in h:
            fails.append(f"missing security header {need}")
    if (h.get("x-content-type-options") or "").lower() != "nosniff":
        fails.append("x-content-type-options is not nosniff")
    # 2 — input validation: a malformed email must be rejected (4xx), not stored
    st, _, _ = http("/api/schools", "POST", {"name": "Probe", "coordinator_email": "notanemail", "city": "X", "state": "Maharashtra"})
    if st < 400:
        fails.append(f"malformed email accepted (status {st}, expected 4xx)")
    # 3 — stored-XSS hardening: an uploaded HTML file must NOT be served inline as text/html
    payload = base64.b64encode(b"<script>alert(1)</script>").decode()
    st, _, b = http("/api/upload", "POST", {"name": "x.html", "contentType": "text/html", "dataB64": payload})
    if st < 300:
        url = (json.loads(b) or {}).get("url", "")
        if url:
            st2, h2, _ = http(url if url.startswith("/") else url.replace(BASE, ""))
            ct, cd = (h2.get("content-type") or "").lower(), (h2.get("content-disposition") or "").lower()
            if "text/html" in ct and "attachment" not in cd:
                fails.append("uploaded HTML served inline as text/html (stored-XSS risk)")
    # 4 — certificate render must require the verification code (no IDOR by id)
    st, _, b = http("/api/certificates")
    try:
        certs = json.loads(b).get("data", [])
    except Exception:
        certs = []
    if certs:
        cid = certs[0]["id"]
        st_nocode, _, _ = http("/api/certificates/" + cid + "/render")
        if st_nocode < 400:
            fails.append("certificate render works without the verification code (IDOR by id)")
    # 5 — rate limit on the test-send relay
    codes = [http("/api/campaign/test", "POST", {"email": "a@b.com", "subject": "s", "html": "<p>x</p>"})[0] for _ in range(25)]
    if 429 not in codes:
        fails.append("no rate limit on /api/campaign/test (no 429 across 25 calls)")
    return fails


def main():
    started = None
    if not up():
        npx = shutil.which("npx") or "npx"                       # resolve the launcher; list-form, no shell (no injection)
        started = subprocess.Popen([npx, "tsx", "app/dev_server.ts"], cwd=str(ROOT), shell=False,
                                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(30):
            if up():
                break
            time.sleep(1)
    try:
        if not up():
            print("security_probe: FAIL — could not reach the app on :3400")
            return 1
        fails = probes()
    finally:
        if started:
            try:
                started.terminate()
            except Exception:
                pass
    for f in fails:
        print(f"  FAIL {f}")
    print("  (DEFERRED to auth-last: IDOR, auth-bypass, RBAC, CSRF — see security.json + memory)")
    if fails:
        print(f"security_probe: FAIL — {len(fails)} finding(s)")
        return 1
    print("security_probe: PASS — headers + input-validation + upload-hardening + rate-limit hold")
    return 0


if __name__ == "__main__":
    sys.exit(main())
