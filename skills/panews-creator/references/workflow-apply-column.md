# Apply for a Column

**Trigger**: The user does not have a column yet, or explicitly asks to apply for a new one.

## Steps

### 1. Tell the user what they need to prepare

- Column name (short and clearly positioned)
- Column description (100 to 200 words describing the content focus and publishing plan)
- Column cover image (upload it first if it is a local file)
- Related links (personal homepage, social media, optional but recommended)

### 2. Upload the cover image if it is local

```bash
node cli.mjs upload-image <file-path> --session <token>
```

### 3. Submit the application

```bash
node cli.mjs apply-column \
  --name "<column name>" \
  --desc "<column description>" \
  --picture <cover-url> \
  --links "https://twitter.com/xxx,https://..." \
  --session <token>
```

### 4. Report the result

Explain that the application has been submitted. Review usually takes a few business days, and publishing can begin after approval.
