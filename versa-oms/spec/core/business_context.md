# Business Context

This document is generated from BRD section 01. Each row remains traceable to its question_id.

## 01.001 — Why does the platform exist?

To let schools participate in affordable, organised Olympiad exams with minimal operational friction.

## 01.002 — What business problem is solved?

Manual school onboarding, student collection, payment tracking, exam scheduling, results, and certificates are fragmented and error-prone.

## 01.003 — Who has the problem?

Finverse operations team, participating schools, school coordinators, students, and parents indirectly.

## 01.004 — What happens without the app?

School data is scattered across email, spreadsheets, payments, folders, and manual follow-ups.

## 01.005 — What is the launch goal?

Run the first school season with a functional school portal and controlled staff operations.

## 01.006 — What is the business model?

Schools collect parent fees, retain commission, and pay Finverse the net amount.

## 01.007 — What is the primary customer?

Participating school as institutional customer.

## 01.008 — What is the end user?

School coordinator for portal operations; students are exam participants, not portal users in MVP.

## 01.009 — What is the school value proposition?

Easy registration, structured exam materials, reliable results, printable certificates, and low technology burden.

## 01.010 — What is the Finverse operational value?

Centralised status tracking, reduced manual errors, controlled payments, and auditable results publication.

## 01.011 — What is the MVP revenue trigger?

Confirmed student count and school payment of net amount due.

## 01.012 — What must the system prevent?

Data leakage across schools, exam material release before payment, result publication without approval, and unauthorised certificate downloads.

## 01.013 — What is the key operational risk?

Incorrect student data, payment mismatch, wrong exam material release, OMR import errors, and ranking mistakes.

## 01.014 — What is the first success metric?

At least one school completes registration, payment, exam slot, result, and certificates end-to-end.

## 01.015 — What is a failure metric?

Any school can access another school’s students, files, payment, result, or certificates.

## 01.016 — What should be automated first?

Status progression, validation, payment gating, file access control, and notifications.

## 01.017 — What should not be automated first?

Final result approval, OMR exception decisions, certificate approval, legal/privacy decisions.

## 01.018 — What is non-negotiable?

School-level isolation, private files, server-side secrets, audit trail, and no public access to student records.

## 01.019 — What is the minimum lovable UX?

A clear dashboard showing registration, students, payment, exam date, materials, courier, results, and certificates.

## 01.020 — What is the first governance rule?

No code generation proceeds without a versioned spec and tests for the module being built.
