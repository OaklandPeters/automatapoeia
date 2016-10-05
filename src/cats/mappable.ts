/**
 * Mappable is the concept of Liftable, but applied to functions.
 * This is very close to the category-theoretic concept of a functor.
 *
 * Whereas 'Liftable' is the ability to raise other types (Domain) into the container type,
 * Mappable can take a function defined on the Domain types, and apply them on the
 * lifted data held inside the container type.
 *
 * Notice - this is very similar to a 'for' loop, where the results of each
 * iteration of the loop is put inside an accumulator of the container type.
 * Note that 'forEach' from Foldable is basically a 'for' loop as well. This is
 * because Mappable ('Monad' actually) can be derived this way:
 *
 * 	 Liftable + Foldable + Monoid ==> Mappable/Monad
 *
 * Where the basic idea is for Monad:
 * map(m: M<T>, f: (v: T) -> T): M<T>
 * 	1. Preform a fold
 * 	1.1. Use a base case of accumulator = m.zero()
 *  1.2. Folding across t:T in M
 *  1.2.1. Apply f, t2 = f(t)
 *  1.2.2. Lift t2 to tm
 *  1.2.3. Append tm to the accumulator
 *
 *
 * TODO: Stop this, until I've built Functor
 */



/* Interfaces
======================== */
interface IMappable<T> {
	/*
	The return type from 'map' is true, but very 'loose' (imprecise).
	Defining it more accurately is beyond the capabilities of TypeScript at this time.
	 */
	map<U>(f: (value: T) => U): IMappable<U>;
}
declare var IMappable: {
	map<T, U, M extends IMappable<T>, N extends IMappable<U>>(
		mappable: M, f: (value: T) => U): N;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Mappable<T> implements IMappable<T> {
	abstract map<U>(f: (value: T) => U): Mappable<U>;
	static map: <T, M extends Mappable<T>, U, N extends Mappable<U>>(
		mappable: M, f: (value: T) => U) => N;
	static is<T>(value: any): value is Mappable<T> {
		/* Warning: This does not have a way to check the internal
		type 'U'. Such a function could be written - but requires
		more requirements for the Mappable class - such as that it is
		Foldable. */
		return (value.map instanceof Function);
	}
}


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
function map<T, M extends Mappable<T>, U, N extends Mappable<U>>(
		mappable: M, f: (value: T) => U): N {
	return mappable.map<U>(f) as N;
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

/* Functors
convert between morphisms (~functions) of two categories.
==================================== */

/* Native versions
equivalents to this categories' method,
for built-in Javascript types
====================================== */

/* Exports
==================== */
export {
	IMappable, Mappable, map
}
