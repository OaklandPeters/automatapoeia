/**
 * Append is the ability to combine two containers of the same type.
 *
 * @TODO: Create a related function/interface for appending dissimlar types
 * -- to represent polymorphic containers (Python lists)
 * @todo: be sure to add shove to Monoid
 */
import {Liftable} from './liftable';
import {Zeroable} from './zeroable';


/* Interfaces
======================== */
interface IAppendable<T> {
	append(other: IAppendable<T>): IAppendable<T>;
}


/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Appendable<T> {
	abstract append(other: Appendable<T>): Appendable<T>;
	static is<T>(value: any): value is Appendable<T> {
		return (value.append instanceof Function);
	}
}


/* Typechecking functions
================================================= */
type Appender<T, V extends Appendable<T>> = {
	append(other: V): V;
} & V;



/* Generic functions
for each abstract method
================================================ */
function append<T, U extends Appendable<T>>(appendable: U, other: U): U {
	/* 
	Disclaimer: There should be other conditions attached to type 'other', but I don't know how to
	represent them in TypeScript

	Notice: the 'append' function can frequently give better type-checking behavior
	than directly using the .append() method on a class. For example, in the merge function:	
		let accumulator = base.zero();
		accumulator.append(base)   // infers type: Appendable<T>
		append(accumulator, base)  // infers type: U

	*/
	return appendable.append(other) as U;
}


/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */
function shove<T>(
	appendable: Appendable<T> & {lift: <U>(value: U) => Appendable<U>},
	element: T): Appendable<T>{
	/* Add a single element into an appendable container.
	This is similar to an immutable version of Javascript's Array.push() method. */
	return appendable.lift<T>(element);
}

function merge<T, U extends Appendable<T> & {zero: () => U}>(
// function merge<T, U extends {append: (other: U) => U, zero: () => U}>(
	base: U, ...appendables: Array<U>): U {
	/*
	 */
	return appendables.reduce(
		(accumulator: U, element: U) => append(accumulator, element),
		append(base.zero(), base)
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
	IAppendable, Appendable, append,
	shove, merge
}
