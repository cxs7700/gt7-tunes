# Moving 499 MB of images without bloating `.git`

**Problem:** The migration needed `images/` (499 MB, 4173 webp) moved to
`public/images/` so Next's static export serves them. Naively re-adding the
files could double the repo's Git history.

**Fix:** Use `git mv images public/images`. Git records this as a rename and
reuses the existing blobs (content-addressed by SHA), so no new object data is
written.

**Verification:** `.git` stayed at 488 MB before and after the move; `git status`
showed 4173 `R` (rename) entries, zero new blobs.

**Why:** Git stores file *content* by hash, not by path. Moving a file only
changes a tree entry; identical content is never duplicated in the object store.

**Note (future):** ~500 MB of binaries in Git is still a poor long-term fit.
If the image set keeps growing, consider Git LFS or an external bucket/CDN.
