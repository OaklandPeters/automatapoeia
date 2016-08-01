import {Iterable, forEach, From as IterableFrom} from './iterable';
import {isEqual} from './equatable';
import {Iterator} from './iterator';



/* Interfaces
======================== */
type FoldFunc<T, U> = (accumulator: U, element: T) => U;
type PredicateFunc<T> = (value: T) => boolean;

interface IFoldable<T> {
	fold<U>(f: (accumulator: U, element: T) => U, initial: U): U;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Foldable<T> implements IFoldable<T> {
	abstract fold<U>(f: (accumulator: U, element: T) => U, initial: U): U;
	static is<T>(value: any): value is Foldable<T> {
		return (value.fold instanceof Function)
	}
}


/* Generic functions for Foldable
======================================= */
function fold<T, U>(foldable: Foldable<T>, f: (accumulator: U, element: T) => U, initial: U): U {
	return foldable.fold(f, initial)
}

function foldAs<T, U, Subject extends Base, Base extends Foldable<T>>(
	subject: Subject,
	base: {new(data: any): Base},
	f: (first: U, second: T) => U,
	initial: U
	): U {
	return base.prototype.fold.call(subject, f, initial)
}

/* Derived functions
=============================== */
function all<T>(foldable: Foldable<T>, predicate: (value: T) => boolean = Boolean) {
	/* Non-short-circuiting 'and' operation' */
	return fold<T, boolean>(foldable, (accumulator, element) => 
 		accumulator && predicate(element), true);
}

function none<T>(foldable: Foldable<T>, predicate: (value: T) => boolean = Boolean) {
	/* Non-short-circuiting 'and' operation. Would be called 'any',but that's
	already defined in TypeScript. */
	return fold<T, boolean>(foldable, (accumulator, element) =>
		accumulator || predicate(element), false);
}

function foldIterable<T, U>(iterable: Iterable<T>, initial: U,
	folder: (accumulator: U, element: T) => U): U {
	let accumulator = initial;
	forEach(iterable, function(value) {
		accumulator = folder(accumulator, value);
	})
	return accumulator;
}

/* Constructors
===================== */
var From = {
	Iterable: function<T>(iterable: Iterable<T>): Foldable<T> {
		return {
			fold: function<U>(f: FoldFunc<T, U>, initial: U): U {
				return foldIterable<T, U>(iterable, initial, f);
			}
		}
	}
}

var To = {
	Array: function foldable_to_array<T>(foldable: Foldable<T>): Array<T> {
		return fold<T, Array<T>>(foldable, (acc, elm) => acc.concat([elm]),
			[] as Array<T>);
	},
	Iterator: function foldable_to_iterator<T, U>(foldable: Foldable<T>, initial: U,
		folder: (accumulator: U, element: T) => U
		): Iterator<T> {
		/* This requires either some sort of queue (such as an array), or 
		pausable exectuion (yield). The array is more-memory intensive, but
		the 'yield' approaches are not yet widely available in browsers. */
		return IterableFrom.Array<T>(To.Array<T>(foldable)).iter()
	}
}

/* Functors & Metafunctions
Functions that modify or decorate morphisms in this category
============================================================== */
function filter<T>(foldable: Foldable<T>, predicate: PredicateFunc<T>): Foldable<T> {
	// Two ways to do this -- either
	// (1) return a simple foldable structure with only the 'fold' method
	return  {
		original: foldable,
		fold: function<U>(f: FoldFunc<T, U>, initial: U): U {
			let filter_f = function(accumulator: U, element: T): U {
				if (predicate(element)) {
					return f(accumulator, element)
				} else {
					return accumulator
				}
			}
			return fold<T, U>(foldable, filter_f, initial)
		}
	} as Foldable<T>
	// (2) try to clone the object, but with this new fold function
	// 	This will work well once ES6 'Proxy's are available
	// let new_foldable = Object.create(foldable);
	// new_foldable.fold = new_fold
	// return new_foldable
}

function filterFoldFunction<T, U>(foldF: FoldFunc<T, U>, predicate: PredicateFunc<T>): FoldFunc<T, U> {
	/* 
	Technically speaking, this is "An endomorphism transforming morphisms in
	the category of Foldable to other morphisms in the same category."
	*/
	return function(accumulator: U, element: T): U {
		if (predicate(element)) {
			return foldF(accumulator, element)
		} else {
			return accumulator
		}
	}
}



export {
	IFoldable,
	Foldable,
	fold,
	all, none, foldIterable,
	From, To,
	filter, filterFoldFunction
}
