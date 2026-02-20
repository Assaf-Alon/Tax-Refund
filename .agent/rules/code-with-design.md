---
trigger: always_on
---

We follow a strict documentation-first approach.

Every major change to the codebase must be accompanied by a detailed markdown document in the `docs/` directory, which will be reviewed by the user **before** starting with the implementation.

This document must cover:
1.  **What** is being changed/added.
2.  **Why** this approach was chosen (context), and if there were any alternatives considered that were rejected, why they were rejected.
3.  **How** it will be implemented. This should be detailed enough for a junior developer to understand the change and implement it themselves on "one shot".
4.  **Verification**: How the change is tested and verified.