# 5 Ws + H completeness matrix — every feature must answer all six (Zachman / EARS)

_Answers are DERIVED from source (which traces to the BRD). A `MISSING` cell = a gap to fill in the BRD/source; `check_5w1h` fails any feature with a gap — not done until all six are answered._

| Feature | WHO | WHAT | WHERE | WHEN | WHY | HOW |
|---|---|---|---|---|---|---|
| OJ1 (participations) | staff | participations | OJ1 | stateful | business-rules | crud+actions |
| OJ-OLY (olympiads) | staff | olympiads | OJ-OLY | stateful | business-rules | crud+actions |
| OJ-AK (answer_keys) | staff | answer_keys | OJ-AK | stateful | business-rules | crud+actions |
| OJ-SR (study_resources) | staff | study_resources | OJ-SR | stateful | business-rules | crud+actions |
| OJ-O1 (school_imports) | staff | school_imports | OJ-O1 | stateful | business-rules | crud+actions |
| OJ-O2 (schools) | staff | schools | OJ-O2 | stateful | business-rules | crud+actions |
| OJ-O3 (email_campaigns) | staff | email_campaigns | OJ-O3 | stateful | business-rules | crud+actions |
| OJ-O3B (email_campaigns) | staff | email_campaigns | OJ-O3B | stateful | business-rules | crud+actions |
| OJ-O4 (email_sends) | staff | email_sends | OJ-O4 | stateful | business-rules | crud+actions |
| OJ3 (payments) | staff | payments | OJ3 | stateful | business-rules | crud+actions |
| OJ4 (exam_slots) | staff | exam_slots | OJ4 | stateful | business-rules | crud+actions |
| OJ5 (exam_materials) | staff | exam_materials | OJ5 | stateful | business-rules | crud+actions |
| OJ-AD (admit_cards) | staff | admit_cards | OJ-AD | stateful | business-rules | crud+actions |
| OJ6 (courier_batches) | staff | courier_batches | OJ6 | stateful | business-rules | crud+actions |
| OJ7 (omr_imports) | staff | omr_imports | OJ7 | stateful | business-rules | crud+actions |
| OJ8 (results) | staff | results | OJ8 | stateful | business-rules | crud+actions |
| OJ9 (certificates) | staff | certificates | OJ9 | stateful | business-rules | crud+actions |
| OJ-RE (re_evaluations) | staff | re_evaluations | OJ-RE | stateful | business-rules | crud+actions |
| OJ-AUDIT (audit_events) | staff | audit_events | OJ-AUDIT | stateful | business-rules | crud+actions |

**19/19 features fully specified.**
