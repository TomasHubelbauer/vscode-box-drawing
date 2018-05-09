# Change Log

All notable changes to the "vscode-box-drawing" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Support for selecting between Unicode (various styles) and ASCII
- Support for drawing arrows (Bresenham)
- Keyboard shortcut

## `3.0.0` (2018-05-09)

- Simplify the code to use an editor command
- Contribute a context menu command *Draw a box enclosing selection*
- Contribute a new context menu command *Insert a drawing canvas* which inserts a 90 characters by 30 lines canvas of spaces
- Bind `Ctrl/Cmd+D+B` to drawing a box and `Ctrl/Cmd+I+C` to inserting the canvas

## `2.0.0` (2018-04-11)

Drop the *VSCode* prefix.

## `1.0.0` (2018-04-04)

- Initial release
- The *Draw a box* command which uses Unicode box drawing characters

## Publishing

[`vsce publish`](https://code.visualstudio.com/docs/extensions/publish-extension)
