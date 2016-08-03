/**
 * Template for the sections in a category file.
 * 
 * Monoids are defined by their binary opertion, and an identity element.
 * In this library, we are calling these 'append' and 'zero'.
 *
 * Note: Monoids are not necessarily containers, and hence are not
 *   necessarily generic-classes either.
 */
import {IZeroable, Zeroable, zero} from './zeroable';
import {IAppendable, Appendable, append} from './appendable';


/* Interfaces
======================== */
interface IMonoid extends IAppendable, IZeroable {
	/*
	
	 */
	equal(other: any): boolean;
	append(other: IMonoid): IMonoid;
	zero(): IMonoid;
} declare var IMonoid: {
	zero(): IMonoid;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Monoid implements IMonoid {
	abstract equal(other: any): boolean;
	abstract zero(): Monoid;
	abstract append(other: Monoid): Monoid;
	static zero: () => Monoid;
	static is(value: any): value is Monoid {
		return (
			Zeroable.is(value)
			&& Appendable.is(value)
		)
	}
}

/* Laws
Assertion functions expressing something which must
be true about the category for it to be sensible, and
are part of its definition, but are not expressible
in the type-system.
================================================= */
function append_identity_law<U extends IMonoid>(monoid: U): boolean {
	let left = append(zero(monoid), monoid);
	let right = append(monoid, zero(monoid));
	return (
	       monoid.equal(left)
	    && monoid.equal(right)
	    && left.equal(right)
	)
}

/* Typechecking functions
================================================= */


/* Generic functions
for each abstract method
================================================ */


/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */
import {Foldable} from './foldable';
function combine<U extends IMonoid>(base: U, ...rest: Array<U>): U {
	fold<U, U>(
		foldable,
		(accumulator: U, element: U) => append(accumulator, element),

	)
}



/* Metafunctions
Functions that modify or decorate morphisms in this category
============================================================== */

/* Constructors
convert between elements (~instances) of two categories
==================================== */

/* Functors
convert between morphisms (~functions) of two categories.
==================================== */

/* Exports
==================== */
export {

}
