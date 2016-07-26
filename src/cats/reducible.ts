/**
 * Reduce is a fold operation on a zeroable data type,
 * which uses the zero as the initial state for the fold.
 *
 * Reduce's most-common usage is in 'join' operations - which flattens
 * a structure via an append operation. This is so useful that it
 * has it's own category - 'Joinable'
 */
import {IFoldable, Foldable, fold, all} from './foldable';
import {IZeroable, Zeroable, zero} from './zeroable';
import {TypeCheckable, AnyType} from './typecheckable';

/* Interfaces
======================== */
interface IReducible<T> extends IFoldable<T>, IZeroable {
	equal(other: any): boolean;
	fold<U>(f: (accumulator: U, element: T) => U, initial: U): U;
} declare var IReducible: {
	zero<U>(): IReducible<U>;
}
type FoldFunc<T, U> = (accumulator: U, element: T) => U;
type ReduceFunc<T, U extends IReducible<T>> = FoldFunc<T, U>;


/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Reducible<T> implements IReducible<T> {
	abstract fold<U>(f: (accumulator: U, element: T) => U, initial: U): U;
	abstract equal(other: any): boolean;
	abstract zero(): this;
	static zero: <T>() => Reducible<T>;
	static is<T>(value: any): value is Reducible<T> {
		return (Foldable.is<T>(value)
			&&  Zeroable.is(value)
			&&  (value.reduce instanceof Function)
		)
	}
}

/* Typechecking functions
================================================= */


/* Generic functions
for each abstract method
================================================ */
function reduce<T, U extends Reducible<T>>(reducible: U, f: ReduceFunc<T, U>): U {
	return fold<T, U>(reducible, f, reducible.zero())
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

/* Exports
==================== */
export {
	IReducible, Reducible, reduce
}
