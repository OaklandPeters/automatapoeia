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
import {Foldable, fold, From as FoldableFrom} from './foldable';
import {equal} from './equatable';


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
function combine<U extends IMonoid>(base: U, ...rest: Array<U>): U {
	return foldArray<T>(
		rest,
		(accumulator: U, element: U) => append(accumulator, element),
		base
	)
	return fold<U, U>(
		FoldableFrom.Array(rest),
		(accumulator: U, element: U) => append(accumulator, element),
		base
	)
}


function repeat<U extends IMonoid>(monoid: U, count: number): U {
	/*
	By analogy, if 'append' is 'plus', this function is multiplication.

	@todo: type check count as an integer
	 */
	 let accumulator = monoid.zero() as U;
	 for(let i = 0; i <= count; i=i+1) {
	 	accumulator = append(accumulator, monoid) as U;
	 }
	 return accumulator
}



/* Metafunctions
Functions that modify or decorate morphisms in this category
============================================================== */

/* Constructors
convert between elements (~instances) of two categories
==================================== */
class NumberMonoid implements IMonoid {
	constructor(public data: number) { }
	append(other: NumberMonoid): NumberMonoid {
		return new NumberMonoid(this.data + other.data)
	}
	zero(): NumberMonoid {
		return new NumberMonoid(0)
	}
	equal(other: NumberMonoid | any) {
		if (other instanceof NumberMonoid) {
			return (this.data === other.data)
		} else {
			return false
		}
	}
}

class ArrayMonoid<T> implements IMonoid {
	constructor(public data: Array<T>) { }
	append(other: ArrayMonoid<T>): ArrayMonoid<T> {
		return new ArrayMonoid(this.data.concat(other.data))
	}
	zero<U>(): ArrayMonoid<U> {
		return new ArrayMonoid([] as Array<U>)
	}
	equal(other: ArrayMonoid<T>): boolean {
		if (other instanceof ArrayMonoid) {
			return (this.data === other.data)
		}
	}
}

var From = {
	Number: function monoidFromNumber(num: number): Monoid {
		return new NumberMonoid(num)
	},
	Array: function monoidFromArray<T>(array: Array<T>): Monoid {
		return new ArrayMonoid(array)
	}
};


/* Functors
convert between morphisms (~functions) of two categories.
==================================== */


/* Laws
=================================== */
import {LawTests, assert} from './cat_support';

class Laws<M extends Monoid> extends LawTests<M> {

	constructor(klass: {new: (values: Array<any>) => M}, random: (seed: number) => M, seed: number = 0) {
		super(klass, random, seed);
	}

	test_leftAppendEquality(): void {
		// x + 0 === x
		let x = this.random(this.seed);
		assert(equal(append(x, zero(x)), x),
			"Failed left append equality: 'x + 0 === x', for seed = {this.seed}");
	}

	test_rightAppendEquality(): void {
		// 0 + x === x
		let x = this.random(this.seed);
		assert(equal(append(zero(x), x), x),
			"Failed right append equality: '0 + x === x', for seed = {this.seed}");
	}
}



/* Exports
==================== */
export {

}
