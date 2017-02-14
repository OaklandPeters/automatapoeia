Working on: reorganize manifold.ts --> manifold/ directory, as interfaces, coordinate, base


Unit-tests
--------------------
* Review current test runner ('mocha') and hae it running on test/calculator-test.js (which I had running at some point)
**  See in package.json: "scripts": { "test": "mocha" },
* Do NOT get distracted by writing or running unittests for anything else. Especially all of the categories


Targetted Unit-Tests
--------------------------
Intention is to provide goals for writing infrastructure tests, and to help maintain focus
1. Get JS unit-test framework working
2. Data initialization - non-random
2.1. And the ability to check it. Ex. size of array
2.2. Maybe do this on Manifold, maybe on lattice (which maybe simpler) 
3. Data initialization - randomized from seed
3.1. check data in specific cell / specific point
3.2. confirm that all cell types are represented
3.3. Check stats on allocation of point types
4. Fetching all points in manifold
5. Fetching neighborhood of a point
6. Applying a rule to a single neighborhood
7. Apply rule to entire Manifold
7.1. Then check updated aggregrate state (as in test #3.2 & 3.3)



Refocus
-----------
* Abandoning the cats/ - to focus on getting the actual project to work.


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
