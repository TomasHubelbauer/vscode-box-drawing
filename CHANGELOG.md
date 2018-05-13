# Change Log

## [Unreleased]

- Respect the `boxDrawing.style` configuration setting when drawing boxes
- Use Unicode middle dot instead of a dash when drawing arrows
- Switch to a new box drawing algorithm

## `3.0.0` (2018-05-09)

- Simplify the code to use an editor command
- Contribute a context menu command *Draw a box enclosing selection*
- Contribute a new context menu command *Insert a drawing canvas* which inserts a 120 characters by 30 lines canvas of spaces
- Bind `Ctrl/Cmd+D+B` to drawing a box and `Ctrl/Cmd+I+C` to inserting the canvas
- Implement rudimentary arrow drawing between selection points using the new *Draw an arrow* command (`Ctrl/Cmd+D+A`)

## `2.0.0` (2018-04-11)

- Drop the *VSCode* prefix.

## `1.0.0` (2018-04-04)

- Introduce the *Draw a box* command which uses Unicode box drawing characters
