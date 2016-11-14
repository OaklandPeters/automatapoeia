/**
 * 
 * A Note on Limitations:
 * Identifiable, and other categories that build on it, make much more sense
 * when defined on a Domain and Codomain.
 * 	The Domain provides a 'type boundary', and this can be thought of as an
 * interface that is 'pinned' to the class instance. This isn't clearly
 * articulable in TypeScript, so I'm leaving it out for now.
 * 
 */


/* Interfaces
======================== */
interface IIdentifiable {
	identity<U extends IIdentifiable>(value: U): U;
}
declare var IIdentifiable: {
	identity<U extends IIdentifiable>(value: U): U;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Identifiable {
	abstract identity<U extends Identifiable>(value: U): U;
	static lift: <U extends Identifiable>(value: U) => Identifiable;
	static is(value: any): value is Identifiable {
		return (value.identity instanceof Function);
	}
}

/* Generic functions
for each abstract method
================================================ */
function identity<U extends Identifiable>(
	value: any,
	identity_category: {identity(x: U): U}): U {
	return identity_category.identity(value)
}

/* Type-Guards: Type-checking functions
================================================= */

/* Laws
Assertion functions expressing something which must
be true about the category for it to be sensible, and
are part of its definition, but are not expressible
in the type-system.
================================================= */
class IdentityLaws<M extends IEquatable, N extends IIdentifiable> extends LawTests<M> {
	objectKlass: {new: (values: Array<any>) => M};
	objectRandom: (seed: number) => M;	
	morphismKlass: {new: (values: Array<any>) => N} & IIdentifiable;
	morphismRandom: (seed: number) => N;
	seed: number;

	constructor(objectKlass: {new: (values: Array<any>) => M},
		        objectRandom: (seed: number) => M,
				seed: number = 0) {
		super(objectKlass, objectRandom, seed);
	}

	test_identity_application() {
		let x = this.objectRandom(this.seed);
		assert(equal(x, this.morphismKlass.identity(x)));
	}

}

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
	Function: function<U>(value: U): U {
		return value;
	}
};

/* Exports
==================== */
export {
	IIdentifiable, Identifiable,
	identity,
	Native
}
