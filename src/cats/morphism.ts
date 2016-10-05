/**
 * 
 *
 * My intention with this is that a Morphism, is a fancy function which
 * expresses both a function-like signature, and a class-like signature.
 * Morphisms will always be within a category.
 *
 * This file will include utility constructors for making these
 */







// Sketch of notes
// Some ability to turn an object inside out

function makeMorphism<T extends Callable>(callable: T): Function & T{
	/**
	 * We have two related objects.
	 * Callable - an object in JS terms. It will have a 'call' function.
	 *     This cannot be directly called via normal Javascript mechanisms.
	 * Morphism - a JS function wrapped around a Callable. It can be called via
	 *     normal JS mechanisms. It also has all of the attributes and methods
	 *     of the Callable pinned to it.
	 */
}


/* Interfaces
======================== */

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */

/* Generic functions
for each abstract method
================================================ */

/* Type-Guards: Type-checking functions
================================================= */

/* Laws
Assertion functions expressing something which must
be true about the category for it to be sensible, and
are part of its definition, but are not expressible
in the type-system.
================================================= */

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
var From = {
};

var To = {
};

/* Functors
convert between morphisms (~functions) of two categories.
==================================== */

/* Native versions
equivalents to this categories' method,
for built-in Javascript types
====================================== */
var Native = {
};

/* Exports
==================== */
export {

}
