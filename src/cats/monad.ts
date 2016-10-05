/**
 * Template for the sections in a category file.
 * 
 * iterable.ts is a good example of this structure.
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
 * @todo: Add a standard monad class, which is also foldable
 * @todo: Decide whether I should build in the methods from applicative, or bind.
 *    Basically the 'amap'/'mmap'
 */
import {IMappable, Mappable, map} from './mappable';
import {ILiftable, Liftable, lift} from './liftable';
import {LawTests, assert} from './cat_support';



/* Interfaces
======================== */
interface IMonad<T> extends IMappable<T>, ILiftable<T> {
	lift<U>(value: U): IMonad<U>;
	map<U>(f: (value: T) => U): IMonad<U>;
} declare var IMonad: {
	lift<U>(value: U): IMonad<U>;
	map<T, U, M extends IMonad<T>, N extends IMonad<U>>(
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




/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
class Monad<T> implements IMonad<T> {
	/*
	Disclaimer: Much like Liftable and Mappable, the type-signatures for Monad are not
	presently expressible in TypeScript (until/unless Higher Kinded Types are incoporated).
	This feature may be
	coming in the future with higher-kinded types: https://github.com/Microsoft/TypeScript/issues/1213
	 */
	abstract lift<U>(value: U): Monad<U>;
	static lift: <U>(value: U) => Monad<U>;
	static is<T>(value: any): value is Monad<T> {
		return (value.lift instanceof Function)
	}
}


/* Laws
Assertion functions expressing something which must
be true about the category for it to be sensible, and
are part of its definition, but are not expressible
in the type-system.
================================================= */
class MonadLaws<M extends Monad> extends LawTests<M> {
	random: (seed: number) => M;
	seed: number;
	klass: {new: (values: Array<any>) => M};

	constructor(klass: {new: (values: Array<any>) => M}, random: (seed: number) => M, seed: number = 0) {
		super(klass, random, seed);
	}

	test_identity_law(): void {

	}
}

class MonoidLaws<M extends Monoid> extends LawTests<M> {
	/**
	 * OVerride this for any particular monoid class.
	 * Requires an argument 'random' which is a function generating
	 */
	random: (seed: number) => M;
	seed: number;
	klass: {new: (values: Array<any>) => M};

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

	test_append_identity_law(): void {
		let monoid = this.random(this.seed);
		let left = append(zero(monoid), monoid);
		let right = append(monoid, zero(monoid));
		assert(monoid.equal(left));
		assert(monoid.equal(right));
		assert(left.equal(right));
	}
}

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

/* Exports
==================== */
export {

}


