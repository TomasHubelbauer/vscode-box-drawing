# `TextEditorEdit`

All `replace`, `insert` and `delete` invocations on the `TextEditorEdit` will be folded to a single undo step.

This leaves purely text-based algorithms with just a single benefit: testing.

But the convenience of the `TextEditorEdit` API outweights that.
