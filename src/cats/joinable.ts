/**
 * Join is a fold using the 'append' operation as the
 * operation and the zero as the initial value.
 */
import {IAppendable, Appendable} from './appendable';
import {IReducible, Reducible} from './reducible';
import {ILiftable, Liftable} from './liftable';


/* Interfaces
======================== */
interface IJoinable<T> extends IReducible<T>, IAppendable<T>, ILiftable<T> {
	/*
	Note: Zeroable requires an 'equal' function.
	*/
	equal(other: any): boolean;
	fold<U>(f: (accumulator: U, element: T) => U, initial: U): U;
	reduce(f: (accumulator: IJoinable<T>, element: T) => IJoinable<T>): IJoinable<T>;
	append(other: IJoinable<T>): IJoinable<T>;
} declare var IJoinable: {
	zero<U>(): IJoinable<U>;
	lift<U>(): IJoinable<U>;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Joinable<T> implements IJoinable<T> {
	abstract fold<U>(f: (accumulator: U, element: T) => U, initial: U): U;
	abstract equal(other: any): boolean;
	abstract zero(): this;
	abstract append(other: this): this;
	abstract lift<T>(value: T): this;
	static zero: <T>() => Joinable<T>;
	static lift: <T>() => Joinable<T>;
	reduce(f: (accumulator: this, element: T) => this): this {
		return this.fold<this>(f, this.zero())
	}


	// join(): List<T> {	
	// 	return this.reduce((accumulator: List<T>, next: T | List<T>) =>
	// 		accumulator.append(
	// 			List.is<T>(next) ? next : List.lift(next)
	// 		)
	// 	)
	// }
	// var arrayJoin = function(arr) {
	//   return arr.reduce(
	//     (accumulator, value) => accumulator.concat(isSameClass(arr, value) ? value : [value])
	//   , [])
	// }

	join(guard?): this {
		/*
		... actually, I suspect this needs a conditional inside it
		 */
		if (guard === undefined) {
			guard = (value) => isSameClass(this, value);
		}

		return this.reduce(
			(accumulator: this, value: T | this) =>
				guard(value) ? value : this.lift<T>(value)
		);

	}
	static is<T>(value: any): value is Reducible<T> {
		return (
			Reducible.is<T>(value)
			&& Appendable.is<T>(value)
			&&  (value.join instanceof Function)
		)
	}
}

/* Typechecking functions
================================================= */
function isSameClass(left, right): boolean {
	return (left.constructor === right.constructor)
}

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

/* Exports
==================== */
export {
	IJoinable
}
