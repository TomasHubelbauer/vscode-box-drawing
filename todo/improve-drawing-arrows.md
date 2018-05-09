# Improve drawing arrows

Introduce a new configuration setting for choosing between angly and slopy arrows.

Operate on text. While all the edits applied on the `TextEditBuilder` are folded into one before application (and thus we have a single undo item / version increment), coupling it to non-mockable (?) VS Code APIs makes it hard to test.
Maybe there are ways to mock. Check https://code.visualstudio.com/docs/extensions/testing-extensions

Draw an arrow head at the selection end.
