

Todo:
============================
* Collect various utility functions into a utility library(ies)
* Make PointBase extend Array
* Move constructors into PointBase - via this.constructor
** Remove constructors from Point2D/Point3D, and give them length assertions
* Replace PointBase.agent: AgentInterface -> Agent from agents.ts
* Grid map() function, needs to support iterating across multiple dimensions
 


Utility functions:
=======================
* assert
* enumerate
* traverseEnumerate -- the high-dimensional one. Returns: [value: T, coordinates: number[]]
* High-dimensional array-like structure: tensor