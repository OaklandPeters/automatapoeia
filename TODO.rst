Working on: reorganize manifold.ts --> manifold/ directory, as interfaces, coordinate, base

Priority
============================
Make a copy of cats/ in it's own repo - and assign a version number.
I think I have already created a basic repo for this somewhere.

Todo:
============================
* Copy out @todo comments from manifold.ts into this document
* NEW GOAL: draft new_grid.ts -- dumber point + grid, but with smarter 'loci' class
** Draw some material from locus.ts
*** Then delete locus.ts
* Replace grid.ts 'GridBase' class - it's gotten clunky. Use new_grid.ts structures instead
* Grid map() function, needs to support iterating across multiple dimensions
** THIS IS HARD
* Change Grid .map() to accumulate a 'path: number[]' instead of an 'index: number'
* Collect various utility functions into a utility library(ies) 
* Simplify OrderedActionInterface --> OrderedActions = Array<ActionInterface>
* [HARD] Action.step(point, grid) needs to be implemented, and will be the hardest. It depends on the structure of rules.

Utility functions:
=======================
* assert
* constructible<T>, Build
* enumerate
* traverseEnumerate -- the high-dimensional one. Returns: [value: T, coordinates: number[]]
* High-dimensional array-like structure: tensor

Unnecessary, but Satisfying:
===============================
* immutable version of Array, plus some basic utility functions
** shove, merge, flatten, append, map, bind
** Hard part: listing all of the array functions to rewrite.
