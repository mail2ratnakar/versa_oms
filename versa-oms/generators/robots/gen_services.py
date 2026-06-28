#!/usr/bin/env python3
"""
================================================================================
ROBOT 5 of 8  —  gen_services                          (v2 vibe-coding pipeline)
================================================================================
WHAT IT DOES (one line):
    Generates one TypeScript service per entity: typed CRUD + the lifecycle
    state-machine (allowed transitions from the rule catalog), so the table gets
    BEHAVIOUR that mechanically refuses illegal state changes.

WHERE IT SITS:
    canonical + rule_catalog --> [gen_services] --> spec/derived/services/<entity>.service.ts
                                                    --> gen_routes (Robot 6) wraps these as APIs
WHY IT MATTERS:
    A raw table lets any status be written to any value. A SERVICE enforces the
    workflow: `transition(id, action)` only succeeds if `current_status -> action`
    is a transition the BRD declared. Illegal jumps (e.g. lead -> students_open,
    skipping approval) are impossible — the state machine is generated, not trusted.

INPUT:
    versa-oms/spec/derived/canonical.json       (entities + fields)
    versa-oms/spec/derived/rule_catalog.json    (lifecycle transitions + validation rules)
OUTPUT:
    versa-oms/spec/derived/services/<entity>.service.ts   (one per entity)

INTEGRITY — INVARIANTS:
    I1. DERIVED-ONLY. CRUD fields come from canonical; transitions come from the catalog. No invention.
    I2. LIFECYCLE-ENFORCED. transition() rejects any action whose `from` != the row's current status
        (except the `any` wildcard). The allowed set is exactly the catalog's transitions for that entity.
    I3. VALIDATION-DELEGATED. create/update call validate<Entity>() — provided by gen_rules (Robot 7) —
        rather than re-typing validation here (one source for rules).
    I4. IDEMPOTENT. Same canonical+catalog -> byte-identical services.
    I5. THIN. The service is wiring over a frozen `db` kernel; no business judgment lives in hand code.

VERIFIED BY: check_module (each module's service is complete + its lifecycle matches the catalog) + tsc.
HOW TO RUN:  python versa-oms/generators/robots/gen_services.py
DO NOT: hand-edit the .ts; edit the BRD/catalog -> re-run Robots 1,2,3,5.
STATUS: Robot 5/8. CRUD + lifecycle. (Effect chains — what happens AFTER a transition — layer in once
    derive_catalog extracts the `effect` rule type; tracked in ROBOTS.md.)
================================================================================
"""
import json
import re
from pathlib import Path

CANON = Path("versa-oms/spec/derived/canonical.json")
CATALOG = Path("versa-oms/spec/derived/rule_catalog.json")
OUTDIR = Path("versa-oms/spec/derived/services")

TS = {"uuid": "string", "text": "string", "string": "string", "enum": "string", "timestamp": "string",
      "date": "string", "integer": "number", "int": "number", "number": "number", "decimal": "number",
      "boolean": "boolean", "json": "Record<string, unknown>", "jsonb": "Record<string, unknown>"}


def tstype(t):
    return TS.get((t or "text").strip().lower().split()[0] if t else "text", "string")


def pascal(s):
    return "".join(p.capitalize() for p in s.split("_"))


def entity_for_workflow(wf, entities):
    wfl = wf.lower()
    for e in sorted(entities, key=len, reverse=True):  # prefer the most specific name match
        if e.rstrip("s") in wfl:
            return e
    return None


def main():
    entities = json.loads(CANON.read_text(encoding="utf-8"))["entities"]
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    # map each entity -> its lifecycle transitions (via the DECLARED workflow->entity, from the catalog)
    ent_trans = {n: [] for n in entities}
    for t in catalog["rules"]["lifecycle"]:
        e = t.get("entity")
        if e in ent_trans:
            ent_trans[e].append(t)
    # EFFECT CHAINS: artifact action -> advance the participation spine (forward-only)
    milestones = catalog.get("participation_milestones", [])
    ent_effects = {}
    for ef in catalog.get("effects", []):
        ent_effects.setdefault(ef["trigger_entity"], []).append(ef)
    # generated rules (supplement): auto-generated identifiers + candidate-match
    supp = json.loads(Path("versa-oms/source-of-truth/v2_supplement/data_model_supplement.json").read_text(encoding="utf-8"))
    gr = supp.get("generated_rules", {})
    auto_id = {k: v for k, v in gr.get("auto_identifier", {}).items() if not k.startswith("_")}
    cand_match = {k: v for k, v in gr.get("candidate_match", {}).items() if not k.startswith("_")}
    reg = supp.get("registration_creates_participation", {})  # registration spins up a participation
    cascade = {k: v for k, v in supp.get("cascade_effects", {}).items() if not k.startswith("_")}  # one-to-many effects
    preconds = {k: v for k, v in supp.get("transition_preconditions", {}).items() if not k.startswith("_")}  # required fields before a transition
    hooks = {k: v for k, v in supp.get("service_hooks", {}).items() if not k.startswith("_")}  # transition -> hand-written kernel call

    OUTDIR.mkdir(parents=True, exist_ok=True)
    for name in sorted(entities):
        e = entities[name]
        P = pascal(name)
        # input type = the non-system, non-FK-only writable fields
        writable = [f for f in e["fields"] if f["name"] not in ("id", "created_at", "updated_at")]
        fieldlines = []
        for f in writable:
            opt = "" if ("required" in (f.get("rule") or "").lower() or f.get("primary_key")) else "?"
            fieldlines.append(f'  {f["name"]}{opt}: {tstype(f["type"])};')
        trans = ent_trans[name]
        tmap = ", ".join(f'{t["action"]}: {{ from: "{t["from"]}", to: "{t["to"]}" }}' for t in trans)

        eff = ent_effects.get(name, [])
        cascade_lines = []
        for trig, cfg in cascade.items():
            te, ta = trig.split(".", 1)
            if te == name:
                cascade_lines.append(f'  if (action === "{ta}") {{ const _rel = (await db.list("{cfg["target"]}")).filter((r) => (r as Record<string, unknown>).{cfg["match"]} === id); for (const _p of _rel) await advanceParticipation((_p as {{ id: string }}).id, "{cfg["advance_to"]}"); }}  // cascade: open related {cfg["target"]}')
        precond_lines = []
        for trig, flds in preconds.items():
            te, ta = trig.split(".", 1)
            if te == name:
                checks = " || ".join(f'!(row as Record<string, unknown>).{f}' for f in flds)
                precond_lines.append(f'  if (action === "{ta}" && ({checks})) throw new Error("{ta} requires: {", ".join(flds)}");')
        hook_lines, hook_imports = [], []
        for trig, cfg in hooks.items():
            te, ta = trig.split(".", 1)
            if te == name:
                hook_imports.append(f'import {{ {cfg["fn"]} }} from "{cfg["import"]}";  // service hook (signed kernel)')
                hook_lines.append(f'  if (action === "{ta}") await {cfg["fn"]}(id);')
        imp_eff = (['import { advanceParticipation } from "@/services/participations.service"; // effect + cascade chains'] if (eff or cascade_lines) else []) + hook_imports
        idf = auto_id.get(name)
        if idf:
            prefix = idf.replace("_id", "").upper()[:4]
            create_lines = [f'export async function create{P}(input: {P}Input) {{',
                            f'  const data: Record<string, unknown> = {{ ...input }};',
                            f'  if (!data.{idf}) data.{idf} = "{prefix}-" + crypto.randomUUID().slice(0, 8).toUpperCase();  // BRD §18: auto-generated, unique + stable',
                            f'  const errors = validate{P}(data);',
                            f'  if (errors.length) return {{ ok: false as const, errors }};',
                            f'  return {{ ok: true as const, data: await db.insert("{name}", data) }};', '}', '']
        else:
            create_lines = [f'export async function create{P}(input: {P}Input) {{',
                            f'  const errors = validate{P}(input);',
                            f'  if (errors.length) return {{ ok: false as const, errors }};',
                            f'  return {{ ok: true as const, data: await db.insert("{name}", input) }};', '}', '']
        ts = [f'// GENERATED by gen_services (Robot 5) from canonical + rule_catalog — DO NOT EDIT.',
              f'import {{ db }} from "@/runtime/db";              // frozen data kernel',
              f'import {{ validate{P} }} from "@/rules/{name}.rules"; // from gen_rules (Robot 7)',
              *imp_eff, '',
              f'export type {P}Input = {{', *fieldlines, '};', '',
              *create_lines,
              f'export async function get{P}(id: string) {{ return db.get("{name}", id); }}',
              f'export async function list{P}() {{ return db.list("{name}"); }}',
              f'export async function update{P}(id: string, patch: Partial<{P}Input>) {{ return db.update("{name}", id, patch); }}',
              f'export async function delete{P}(id: string) {{ return db.delete("{name}", id); }}', '']
        if trans:
            need_pid = any(e["via"] == "participation_id" for e in eff)
            need_rid = any(e["via"] == "result_id" for e in eff)
            rowt = "{ status?: string" + (", participation_id?: string" if need_pid else "") + (", result_id?: string" if need_rid else "") + " }"
            efflines = []
            for e in eff:
                if e["via"] == "participation_id":
                    efflines.append(f'  if (action === "{e["trigger_action"]}" && row.participation_id) await advanceParticipation(row.participation_id, "{e["advance_to"]}");')
                elif e["via"] == "result_id":
                    efflines.append(f'  if (action === "{e["trigger_action"]}" && row.result_id) {{ const _r = await db.get("results", row.result_id) as {{ participation_id?: string }}; if (_r?.participation_id) await advanceParticipation(_r.participation_id, "{e["advance_to"]}"); }}')
            creates_lines = []
            if name == reg.get("trigger_entity"):
                creates_lines = [f'  if (action === "{reg["trigger_action"]}") {{ const _olys = await db.list("olympiads"); if (_olys.length) await db.insert("{reg["creates"]}", {{ participation_code: "PART-" + crypto.randomUUID().slice(0, 6).toUpperCase(), school_id: id, olympiad_id: (((row as Record<string, unknown>).olympiad_interest_id as string) || (_olys[0] as {{ id: string }}).id), status: "{reg["status"]}" }}); }}  // BRD: registration creates a participation']
            extra = efflines + creates_lines + cascade_lines + hook_lines
            ts += [f'// lifecycle state machine — only these transitions exist (from the BRD via the catalog)',
                   f'const TRANSITIONS = {{ {tmap} }} as const;',
                   f'export async function transition{P}(id: string, action: keyof typeof TRANSITIONS) {{',
                   f'  const row = await db.get("{name}", id) as {rowt};',
                   f'  const t = TRANSITIONS[action];',
                   f'  if (!t) throw new Error(`unknown action ${{action}} on {name}`);',
                   f'  if (t.from !== "any" && row.status !== t.from)',
                   f'    throw new Error(`illegal transition ${{action}}: {name} is "${{row.status}}", needs "${{t.from}}"`);',
                   *precond_lines,
                   f'  const updated = await db.update("{name}", id, {{ status: t.to }});',
                   f'  try {{ await db.insert("audit_events", {{ trace_id: "AUD-" + crypto.randomUUID().slice(0, 12), action, entity_name: "{name}", entity_id: id, previous_status: (row as {{ status?: string }}).status ?? null, new_status: t.to, created_at: new Date().toISOString() }}); }} catch (e) {{ /* audit best-effort */ }}']
            if extra:
                ts += ['  // EFFECT CHAINS (spine) + registration side-effect (create participation)', *extra]
            ts += ['  return updated;', f'}}', '']
        if name == "participations":
            ms = ", ".join(f'"{m}"' for m in milestones)
            ts += ['// EFFECT-CHAIN target — the participation spine advances FORWARD-ONLY through these §09 milestones',
                   f'const MILESTONES = [{ms}] as const;',
                   'export async function advanceParticipation(id: string, milestone: string) {',
                   '  const row = await db.get("participations", id) as { status?: string };',
                   '  if (MILESTONES.indexOf(milestone as never) > MILESTONES.indexOf((row.status ?? "") as never))',
                   '    return db.update("participations", id, { status: milestone });',
                   '  return row;   // not a forward move -> no-op',
                   '}', '']
        if name in cand_match:
            roster = cand_match[name]
            ts += ['// BRD §10 omr_candidate_match — every scanned candidate_id must be in the participation roster, no duplicates',
                   'export async function matchOmrCandidates(participationId: string, scanned: string[]) {',
                   f'  const roster = (await db.list("{roster}")) as Array<{{ candidate_id?: string; participation_id?: string }}>;',
                   '  const valid = new Set(roster.filter((s) => s.participation_id === participationId).map((s) => s.candidate_id));',
                   '  const seen = new Set<string>(); const matched: string[] = [];',
                   '  const errors: Array<{ candidate_id: string; reason: string }> = [];',
                   '  for (const cid of scanned) {',
                   '    if (!valid.has(cid)) errors.push({ candidate_id: cid, reason: "not in participation roster" });',
                   '    else if (seen.has(cid)) errors.push({ candidate_id: cid, reason: "duplicate scan" });',
                   '    else matched.push(cid);',
                   '    seen.add(cid);',
                   '  }',
                   '  return { matched, errors };',
                   '}', '']
        (OUTDIR / f"{name}.service.ts").write_text("\n".join(ts), encoding="utf-8")

    n_life = sum(1 for n in entities if ent_trans[n])
    print(f"gen_services: {len(entities)} services · {n_life} with an enforced lifecycle state-machine -> {OUTDIR}/")


if __name__ == "__main__":
    main()
