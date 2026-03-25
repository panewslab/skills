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
export PA_USER_SESSION="<token>"
node cli.mjs upload-image <file-path>
```

Security note: do not pass session tokens on the command line, because they may be exposed in shell history or process lists. Prefer environment variables or a secure credential store.

### 3. Submit the application

```bash
node cli.mjs apply-column \
  --name "<column name>" \
  --desc "<column description>" \
  --picture <cover-url> \
  --links "https://twitter.com/xxx,https://..."
```

Use `export`, `direnv`, or a secret manager to provide `PA_USER_SESSION` without hardcoding it into commands.

### 4. Report the result

Explain that the application has been submitted. Review usually takes a few business days, and publishing can begin after approval.
