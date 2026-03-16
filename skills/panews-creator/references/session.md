---
name: session
description: PA-User-Session authentication — how to resolve, validate, and handle session errors for PANews creator API calls.
---

# Session Authentication

All creator endpoints require a `PA-User-Session` request header.

## Resolution Order

Resolve session value from the following sources in order:

1. Environment variable `PANEWS_USER_SESSION`
2. Environment variable `PA_USER_SESSION`
3. Environment variable `PA_USER_SESSION_ID`
4. Browser DevTools: copy the `PA-User-Session` header value from any authenticated request on `www.panewslab.com`

## Validation

Call `GET /user` with the session header to verify it is valid before proceeding with any workflow.

```http
GET https://universal-api.panewslab.com/user
PA-User-Session: <session>
```

## Error Handling

- `401` — session is invalid or expired; discard and re-resolve from the beginning
- Never cache a session that returned 401
- Validate the session before any mutating request, not after a failed publish
