# Prompt: Answers to Source-of-Truth CSV

You are converting questionnaire answers into a source-of-truth CSV.

Rules:
- Preserve every question_id.
- If the user did not answer, draft a clear assumption and mark answer_source=llm_draft or assumption.
- Mark needs_user_review=true for assumptions or low-confidence answers.
- affected_modules must be explicit.
- Do not omit unanswered questions.
- Do not collapse multiple requirements into one vague answer.
- Do not truncate.
