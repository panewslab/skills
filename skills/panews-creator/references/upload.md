---
name: upload
description: Image upload endpoint — upload a local file or remote URL to PANews CDN before using it as a cover or column picture.
---

# Image Upload

`PUT /upload`

Uploads an image and returns a CDN URL. Upload images **before** using them as article covers or column pictures.

## Supported Formats

`PNG` / `JPG` / `GIF` / `WebP` / `AVIF`

## Request

Multipart form-data with the image file in the `file` field. Optional `watermark` boolean field.

```http
PUT https://universal-api.panewslab.com/upload
PA-User-Session: <session>
Content-Type: multipart/form-data

file=<binary>
watermark=false
```

## Response

```json
{ "url": "https://cdn.panewslab.com/..." }
```

Use the returned `url` as the `cover` field when creating/updating articles, or as `picture` in column applications.
