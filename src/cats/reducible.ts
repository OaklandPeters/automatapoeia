/**
 * Reduce is a fold operation on a zeroable data type,
 * which uses the zero as the initial state for the fold.
 * 
 */
import {IFoldable, Foldable, all} from './foldable';
import {IZeroable, Zeroable} from './zeroable';
import {TypeCheckable, AnyType} from './typecheckable';

/* Interfaces
======================== */
interface IReducible<T> extends IFoldable<T>, IZeroable {
	/*
	Note: Zeroable requires an 'equal' function.
	*/
	equal(other: any): boolean;
	fold<U>(f: (accumulator: U, element: T) => U, initial: U): U;
	reduce(f: (accumulator: IReducible<T>, element: T) => IReducible<T>): IReducible<T>;
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
	abstract zero(): Reducible<T>;
	static zero: <T>() => T;
	reduce(f: (accumulator: Reducible<T>, element: T) => Reducible<T>): Reducible<T> {
		return this.fold<Reducible<T>>(f, this.zero())
	}
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
function reduce<T>(reducible: Reducible<T>, f: ReduceFunc<T, Reducible<T>>): Reducible<T> {
	return reducible.reduce(f)
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

}