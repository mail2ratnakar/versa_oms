# Prompt: Scope to Questionnaire

You are generating a requirements questionnaire from a product scope.

Input:
- A brief product scope
- Current module state, if any
- 14-parameter playbook

Task:
Generate a complete questionnaire that can later become a source-of-truth CSV.

Rules:
- Ask questions grouped by business area.
- Cover actors, workflows, data, lifecycle states, permissions, validations, security, approvals, reports, exports, exceptions and dependencies.
- Every question must include likely affected modules.
- Do not produce generic filler.
- Do not truncate.
- Return CSV rows or JSON array exactly as requested by the caller.
