Todo:
============================
* Grid map() function, needs to support iterating across multiple dimensions
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