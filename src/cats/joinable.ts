/**
 * Join is a fold using the 'append' operation as the
 * operation and the zero as the initial value.
 * This is a type-neutral (IE doesn't depend on Array) way to
 * concatenate multiple instances of a container.
 * 
 * @todo: Provide examples of natural joins - for array, string
 * @todo: Determine if 'join' should act like flatten - and be able
 *   to operate on mixed nested and non-nested (this requires lift)
 *   (and a guard function)
 */
import {IAppendable, Appendable, append} from './appendable';
import {IReducible, Reducible, reduce} from './reducible';
import {ILiftable, Liftable, lift} from './liftable';
import {zero} from './zeroable';
import {Foldable, fold} from './foldable';


/* Interfaces
======================== */
interface IJoinable<T> extends IReducible<T>, IAppendable, ILiftable<T> {
	/*
	Note: Zeroable requires an 'equal' function.
	*/
	equal(other: any): boolean;
	fold<U>(f: (accumulator: U, element: T) => U, initial: U): U;
	append(other: IJoinable<T>): IJoinable<T>;
	zero<U>(): IJoinable<U>;
	lift<U>(value: U): IJoinable<U>;
} declare var IJoinable: {
	zero<U>(): IJoinable<U>;
	lift<U>(value: U): IJoinable<U>;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Joinable<T> implements IJoinable<T> {
	abstract fold<U>(f: (accumulator: U, element: T) => U, initial: U): U;
	abstract equal(other: any): boolean;
	abstract zero<U>(): Joinable<U>;
	abstract append(other: IJoinable<T>): IJoinable<T>;
	abstract lift<U>(value: U): IJoinable<U>;
	static zero: <U>() => Joinable<U>;
	static lift: <U>(value: U) => Joinable<U>;
	static is<T>(value: any): value is Reducible<T> {
		return (
			Reducible.is<T>(value)
			&& Appendable.is(value)
			&&  (value.join instanceof Function)
		)
	}
}

/* Typechecking functions
================================================= */

/* Generic functions
for each abstract method
================================================ */
function join<T, U extends IJoinable<T>, V extends IJoinable<U>>(joinable: V): U {
	/* 
	Note: join requires a Joinable containing only other Joinables.
	Note 2: we would like to require that the inner type matches the outer type, but
		TypeScript has no way to articulate this. IE we would like the generic params to be:
		join<T, U extends IJoinable>(joinable: U<U<T>>): U<T>
	
	This caries out what is basically a 'reduce', but the type-signature of .zero()
	does not quite work out for that - so we use a 'fold' instead.
	 */
	return fold<U, U>(
		joinable,
		(accumulator: U, element: U) => append(accumulator, element),
		joinable.zero<T>() as U
	) as U;
}


/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */
function arrayJoin<T>(array: Array<Array<T>>): Array<T> {
	return array.reduce<Array<T>>(
		(acc: Array<T>, elm: Array<T>) => acc.concat(elm),
		[] as Array<T>
	);
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
	IJoinable, Joinable, join,
	arrayJoin
}
