---
name: Git mutation safety wrapper
description: "How to perform authorized Git changes when the workspace shell blocks them."
---

**Rule:** If the shell blocks Git index mutations with a workspace safety warning, rerun only the authorized Git operation with `DANGEROUSLY_ALLOW_GIT=1`; use Bash when shell options such as `pipefail` are needed.

**Why:** The workspace shell guards Git mutations to protect the Replit Git setup, so ordinary staging or commit commands may be rejected.

**How to apply:** Use the prefix only for narrowly scoped, user-authorized Git operations. Do not use it to bypass unclear permission or stage unrelated files.
