# Table Rules

## General

- Tables are for operational scanning.
- Default density: comfortable.
- Provide compact density toggle later.
- Sticky header for long tables.
- Row actions should be explicit.
- Bulk actions appear only after selection.

## Required Table Features

- Search.
- Safe filters.
- Sort where useful.
- Pagination.
- Column visibility later.
- Status badges.
- Empty state.
- Error state.
- Loading skeleton.
- Export button only where authorized.

## Forbidden

- Do not show raw sensitive fields by default.
- Do not trust browser-submitted filters.
- Do not put destructive actions directly in row without confirmation.
- Do not use color alone for status.
- Do not expose private file URLs.

## Recommended Columns

- Code/reference.
- Name/title.
- Status.
- Owner/assigned user.
- School where relevant.
- Exam cycle where relevant.
- Updated at.
- Actions.

## Sensitive Tables

Sensitive tables require:

- masking.
- audit on reveal.
- reason before export.
- source-module permission recheck.
