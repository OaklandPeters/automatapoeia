import {Iterable, Iterator, IterationResult, forLoop, array_to_iterable} from './iterable';
import {isEqual} from './equatable';


interface IFoldable<T> {
	fold<U>(f: (first: U, second: T) => U, initial: U): U;
}

abstract class Foldable<T> implements IFoldable<T> {
	abstract fold<U>(f: (first: U, second: T) => U, initial: U): U;
	static is<T>(value: any): value is Foldable<T> {
		return (value.fold instanceof Function)
	}
}


/* Generic functions for Foldable
======================================= */
function fold<T, U>(foldable: Foldable<T>, f: (first: U, second: T) => U, initial: U): U {
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
 	return foldable.fold<boolean>((accumulator, element) => 
 		accumulator && predicate(element), true);
}

function none<T>(foldable: Foldable<T>, predicate: (value: T) => boolean = Boolean) {
	/* Non-short-circuiting 'and' operation. Would be called 'any',but that's
	already defined in TypeScript. */
	return foldable.fold<boolean>((accumulator, element) =>
		accumulator || predicate(element), false);
}

/* Functors
===================== */
function foldable_to_array<T>(foldable: Foldable<T>): Array<T> {
	return foldable.fold<Array<T>>((acc, elm) => acc.concat([elm]), [] as Array<T>)
}

function foldable_to_iterator<T, U>(foldable: Foldable<T>, initial: U,
	folder: (accumulator: U, element: T) => U
	): Iterator<T> {
	/* This requires either some sort of queue (such as an array), or 
	pausable exectuion (yield). The array is more-memory intensive, but
	the 'yield' approaches are not yet widely available in browsers. */
	return array_to_iterable(foldable_to_array(foldable)).iter()
}

function foldIterable<T, U>(iterable: Iterable<T>, initial: U,
	folder: (accumulator: U, element: T) => U): U {
	let accumulator = initial;
	forLoop(iterable, function(value) {
		accumulator = folder(accumulator, value);
	})
	return accumulator;
}

class IterableToFoldable<T> extends Foldable<T> {
	iterable: Iterable<T>;
	iterator: Iterator<T>;

	constructor(iterable: Iterable<T>) {
		super();
		this.iterable = iterable;
	}

	fold<U>(folder: (accumulator: U, element: T) => U, initial: U): U {
		return foldIterable<T, U>(this.iterable, initial, folder);
	}
}




export {
	IFoldable,
	Foldable,
	fold,
	all, none,
	foldIterable, IterableToFoldable
}