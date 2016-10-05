import {Iterable, forEach, fold as foldIterable, From as IterableFrom, iter} from './iterable';
import {isEqual} from './equatable';
import {Iterator, range} from './iterator';
import {IIndexable, items, From as IndexableFrom} from './indexable';


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


/* Type-Guards: Type-checking functions
================================================= */
function isFoldableOf<T>(
	value: any,
	innerClass: {is: (value: any) => value is T}): value is IFoldable<T> {
	/**
	 * This is a very valuable function - because it allows us to know something about
	 * the inner-types contained inside it.
	 *
	 * TECHNICALLY - this can be executed on any foldable data-structure, but it
	 * is probably only meaningful on Liftable/generic data containers.
	 * These will often be monads.
	 *
	 * NOTE - the canonical very of this function is in typecheckable:
	 * 'isTypeFoldableContaining'. However this function ('isFoldableOf') is left
	 * inside 'foldable.ts' to demonstrate the role that Foldable plays in navigating
	 * the internals of container-types.
	 */
	if (Foldable.is<any>(value)){
		return all(value, innerClass.is);
	} else {
		return false;
	}
}


/* Generic functions for Foldable
======================================= */
function fold<T, U>(foldable: Foldable<T>, f: (accumulator: U, element: T) => U, initial: U): U {
	return foldable.fold<U>(f, initial)
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

/* Constructors
===================== */
var From = {
	Array: function<T>(array: Array<T>): Foldable<T> {
		return {
			fold: function<U>(f: FoldFunc<T, U>, initial: U): U {
				return array.reduce<U>(f, initial)
			}
		}
	},
	Iterable: function<T>(iterable: Iterable<T>): Foldable<T> {
		return {
			fold: function<U>(f: FoldFunc<T, U>, initial: U): U {
				return foldIterable<T, U>(iterable, f, initial);
			}
		}
	}
};

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


/* Native versions
equivalents to this categories' method,
for built-in Javascript types
====================================== */
let Native = {
	Array: function<T, U>(array: Array<T>, f: FoldFunc<T, U>, initial: U): U {
		return array.reduce<U>(f, initial)
	},
	String: function<U>(_string: string, f: FoldFunc<string, U>, initial: U): U {
		/* Fold one character at a time from '_string', retreiving via numeric indices */
		let iterator = iter(new IndexableFrom.String(_string));
		return foldIterable<string, U>(iterator, f, initial);
	}
}

function foldRange<U>(count: number, action: (accumulator: U, i: number) => U, initial: U): U {
	/*
	Equivalent to folding a range array, number from 0 to count - 1,
	and preforming an action for every step (potentially based on that number).
	 */
	return foldIterable<number, U>(
		range(count),
		action,
		initial
	);
}


export {
	IFoldable,
	Foldable,
	fold,
	all, none, foldIterable,
	From, To,
	filter, filterFoldFunction
}
