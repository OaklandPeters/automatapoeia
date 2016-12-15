Working on: reorganize manifold.ts --> manifold/ directory, as interfaces, coordinate, base


MOST IMPORTANT: update Typescript version to 2.1
--------------------------------------------------
* to get access to:
** object rest & spread
** keyof and Lookup Types
** Mapped types
* Create a summary of what these are and how to use them


Unit-tests
--------------------
* Find, install, learn a Javascript NPM unit-test package
* Get test-runner to run the law-tests I've already learned
* Do NOT get distracted by writing or running unittests for anything else. Especially all of the categories without law-tests


=======================
THE RETURN
=======================
Completion: Monad --> Sequence/ImmutableSequence --> Vector/ImmutableVector --> Manifold
After completing Manifold:
* Update repo 'theoryofcats' with the completed cateogries
* return to the actual automatapoeia work, and get that working for the 2d case.



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
