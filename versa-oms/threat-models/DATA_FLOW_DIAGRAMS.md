# DATA_FLOW_DIAGRAMS.md

## 1. Staff Auth Flow

```mermaid
flowchart LR
  Browser[Staff browser] --> App[Versa app]
  App --> Session[Session/Auth store]
  App --> RBAC[Role and scope guard]
  RBAC --> ModuleAPI[Staff module API]
  ModuleAPI --> Audit[Append-only audit]
  ModuleAPI --> DB[(Database)]
```

## 2. School Scope Flow

```mermaid
flowchart LR
  SchoolBrowser[School browser] --> SchoolAPI[School API]
  SchoolAPI --> Session[School session]
  Session --> ScopeGuard[Own-school scope guard]
  ScopeGuard --> SafeView[School-safe view]
  SafeView --> DB[(Database)]
  SchoolAPI --> Audit[Audit event]
```

## 3. Payment Flow

```mermaid
flowchart LR
  Staff[Finance staff] --> FinanceAPI[Finance API]
  School[School portal] --> PaymentLink[Payment link]
  Provider[Payment provider] --> Webhook[Webhook API]
  Webhook --> Signature[Signature validation]
  Signature --> FinanceService[Finance service]
  FinanceService --> Audit[Finance audit]
  FinanceService --> DB[(Database)]
```

## 4. Exam Material Release Flow

```mermaid
flowchart LR
  Staff[Exam staff] --> Approval[Maker-checker approval]
  Approval --> ReleaseAPI[Material release API]
  ReleaseAPI --> PrivateStorage[Private storage]
  School[School user] --> DownloadAPI[Download request]
  DownloadAPI --> ScopeGuard[Permission and school scope]
  ScopeGuard --> SignedURL[Short-lived signed URL]
  DownloadAPI --> Audit[Download audit]
```

## 5. Evaluation to Result to Certificate Flow

```mermaid
flowchart LR
  OMR[OMR import] --> Eval[Evaluation service]
  Eval --> ScoreBatch[Approved score batch]
  ScoreBatch --> Result[Result generation]
  Result --> Publish[Publication approval]
  Publish --> Cert[Certificate generation]
  Cert --> Verify[Public verification]
  Publish --> Audit[Audit]
  Cert --> Audit
```

## 6. Sensitive Export Flow

```mermaid
flowchart LR
  Staff[Staff request] --> ExportAPI[Export API]
  ExportAPI --> Reason[Reason required]
  Reason --> Approval[Sensitive export approval]
  Approval --> Masking[Masking and filtering]
  Masking --> PrivateFile[Private export file]
  PrivateFile --> SignedURL[Signed URL]
  SignedURL --> DownloadAudit[Download audit]
```
