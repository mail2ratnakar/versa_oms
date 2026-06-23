# API_NAMING_RULES.md

## Route Naming

- Staff APIs: `/api/staff/<module-resource>`
- School APIs: `/api/school/<resource>`
- Internal APIs: `/api/internal/<system-resource>`
- Public verification APIs: `/api/verify/<resource>`

## Resource Naming

- Use plural nouns: `/users`, `/schools`, `/results`, `/certificates`.
- Use kebab-case in routes.
- Use snake_case in JSON fields.
- Use UUID path parameter `{id}` for internal records.
- Use business verification code only for public verification.

## Operation Naming

- List: `GET /resource`
- Detail: `GET /resource/{id}`
- Create: `POST /resource`
- Transition: `POST /resource/{id}/transition`
- Approve: `POST /resource/{id}/approve`
- Reject: `POST /resource/{id}/reject`
- Export: `POST /resource/exports`
- Download: `POST /resource/{id}/download`

## Forbidden Naming

- Do not expose table names directly if unsafe.
- Do not expose `/admin/delete`.
- Do not expose `/public/students`.
- Do not expose raw file paths.
- Do not expose raw audit, OMR, answer key or provider payload routes publicly.
