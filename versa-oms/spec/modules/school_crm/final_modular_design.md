# School CRM Module — Final Modular Design

The School CRM module is the fourth company/internal portal module under `/spec/modules/school_crm/`.

It manages pre-onboarding school acquisition: leads, pipeline stages, interactions, follow-ups, imports, duplicates and conversion into school onboarding.

## Non-negotiable rules
1. School CRM is staff-only.
2. Public and school roles have no CRM lead access.
3. Every active lead has a lead owner.
4. Non-admin staff see assigned leads/regions only.
5. Pipeline stages are controlled.
6. Lost reason is mandatory.
7. Follow-up stages require follow-up dates.
8. Interactions are recorded for contact/demo/proposal evidence.
9. Duplicate detection runs on create/import and before conversion.
10. Confirmed duplicates cannot convert.
11. Lead conversion creates or links school onboarding record.
12. Converted lead keeps CRM history.
13. Import files are private.
14. Hard delete is forbidden.

## Future extension examples
WhatsApp API integration, email campaign automation, AI lead scoring, demo calendar integration, source ROI dashboard, bulk outreach sequencing, partner/referral portal.

## Bug fix continuity
Every School CRM bug fix must add a regression test, especially for duplicate conversion, lead owner scope, lost reason, private imports, conversion link and public/school access denial.
