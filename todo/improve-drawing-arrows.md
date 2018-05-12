# Improve drawing arrows

Introduce a new configuration setting for choosing between angly and slopy arrows.

Draw an arrow head at the selection end.

Do not draw the first pixel, remember it and then keep on drawing the `N - 1` pixel at `N` iteration.
This way it is possible to tell what will the spatial relation between the next pixel (current iteration) and current pixel (remembered stuff) be.
That will make it possible to use a `switch` on all of the relations and choose the proper symbol to approximate line.
