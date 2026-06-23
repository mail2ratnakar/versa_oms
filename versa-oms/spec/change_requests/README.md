# Change Requests

Every behavior change enters here — **never as an ad-hoc code edit**. See
`spec/SPEC_DRIVEN_METHOD.md` for the binding rule.

## Flow
1. Write a CR file: `CR-NNNN-slug.change.json` (copy `_TEMPLATE.change.json`). It records
   **what** and **why**, the **target spec(s)**, the **generators** to re-run, and the
   **verification**.
2. Apply the edit to the **target spec** (screen / actions / effects / schema / …).
3. Run the generators listed in the CR.
4. Run the verify step (vitest + the JRN e2e).
5. Set `status: applied`.

A CR is the audit trail of why a spec changed. If a user asks for a change, capture it as
a CR first, then act on the spec — do not hand-edit generated output.
