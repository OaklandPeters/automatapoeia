/**
 * Template for the sections in a category file.
 * 
 * iterable.ts is a good example of this structure.
 *
 * Overview:
 * --------------------------
 * 	Interfaces
 * 	ABCs
 * 	Laws
 * 	Type-Gaurds
 * 	Generic functions
 * 	Derivable functions
 * 	Metafunctions
 * 	Constructors
 * 	Functors
 * 	Native
 * 	Exports
 */


/* Interfaces
======================== */

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */

/* Laws
Assertion functions expressing something which must
be true about the category for it to be sensible, and
are part of its definition, but are not expressible
in the type-system.
================================================= */

/* Type-Guards: Type-checking functions
================================================= */

/* Generic functions
for each abstract method
================================================ */

/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */

/* Metafunctions
Functions that modify or decorate morphisms in this category
============================================================== */

/* Constructors
convert between elements (~instances) of two categories
==================================== */

/* Functors
convert between morphisms (~functions) of two categories.
==================================== */

/* Native versions
equivalents to this categories' method,
for built-in Javascript types
====================================== */
function arrayMerge<T>(array: Array<T | Array<T>>): Array<T> {
	/* Example native join operation, on built-in Javascript arrays. */
	return array.reduce<Array<T>>(
		(acc: Array<T>, elm: Array<T> | T) =>
			(elm instanceof Array) ? acc.concat(elm) : acc.concat([elm]),
		[] as Array<T>
	)
}


/* Exports
==================== */
export {

}
