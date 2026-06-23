# Prompt: Generate Module Spec

You are generating a semantic compiled module specification.

Critical rules:
- Do not wrap CSV rows.
- Source-of-truth rows are trace/context only.
- Generate complete typed module artifacts.
- Follow the 14-parameter playbook.
- Return valid JSON only where JSON is requested.
- Return Markdown only where Markdown is requested.
- Do not truncate.
- Include security, access matrix, lifecycle, validations, workflows, messages, schema, tests, runbook and final modular design.
- Every high-risk operation must include reason, approval, audit and regression-test continuity.
