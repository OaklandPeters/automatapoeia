/**
 *
 * The equivalent from ES6 is 'ForEachAble'
 * 	in JS, 'Map.forEach(f)' f: (value, key) => void
 * 	       'iterator' (for (x of mymap)) --> x: [key, value] 
 *
 * @todo: Rename and restructure this to 'Indexable'
 * 	core functions: items(), keys()
 * Rule: most type-variant parameter is the one returned from iter()
 */
import {isNotDone, iterable_to_array, IterationResult, ArrayIterator, forLoop, fold} from './iterable';
import {IRecord, Record} from './record';
import {isEqual} from './equatable';


interface IEnumerable<C, T> extends IRecord<C, T> {
	/* This is an iterable data type with a concept of index (or key) in addition
	to values. This allows you to use.
	When IEnumerable's are also IIterable's, we generally expect
	iter() to return the keys/indexes, and not the values.
	(Array violates this though)
	*/
	enumerate(): Array<[C, T]>;
}

interface IEnumerator<C, T> extends IIterator<[C, T]> {
	next(): IterationResult<[C, T]>;
}

abstract class Enumerable<C, T> implements IRecord<C, T> {
	abstract getitem(i: C): T;
	abstract enumerate(): Enumerator<C, T>;
}

abstract class Enumerator<C, T> implements IEnumerator<C, T>, IIterator<[C, T]> {
	abstract next(): IterationResult<[C, T]>;
	iter(): Enumerator<C, T> {
		return this;
	}
}

/* Functors for Enumerable
=================================== */
function array_to_enumerable<T>(array: Array<T>): Enumerable<number, T> {
	return {
		getitem(index: number): T {
			return array[index]
		},
		enumerate(): Enumerator<number, T> {
			return new ArrayIterator<[number, T]>(array.map((value, index) => [index, value] as [number, T]))
		}
	}
}

class IterableEnumerator<T> extends Iterator<[number, T]>{
	/* Generates an Enumerator for an Iterable.
	*/
	data: Iterable<T>;
	done: boolean;
	counter: number;
	iterator: Iterator<T>;

	constructor(data: Iterable<T>) {
		super();
		this.data = data;
		this.done = false;
		this.counter = 0;
		this.iterator = data.iter();
	}
	next(): IterationResult<[number, T]> {
		if (!this.done) {
			this.counter = this.counter + 1;
			let result = this.iterator.next();
			if (isNotDone<T>(result)) {
				return {
					value: [this.counter, result.value],
					done: false
				}
			} else {
				this.done = true;
				return {done: true}
			}
		} else {
			return {done: true}
		}
	}
}

function enumerable_to_array<C, T>(enumerable: Enumerable<C, T>): Array<[C, T]> {
	return iterable_to_array<[C, T]>(enumerable.enumerate())
}

/* Derivable Utility functions
===================================  */
function find<C, T>(enumerable: Enumerable<C, T>, target: T): Array<C> {
	/* Return all keys in enumerable where the value is equal to target. */
	let folder = (acc: Array<C>, [key, value]: [C, T]) =>
		isEqual(target, value) ? acc.concat([key]) : acc;
	return fold<[C, T], Array<C>>(enumerable.enumerate(), folder, [] as Array<C>)
}


// private static pair<L, R>(left: L[], right: R[], count: number): [L, R][] {
// 	return Array.apply(null, Array(count)).map((_: any, i: number) => [left[i], right[i]])
// }
// static shortest<L, R>(left: L[], right: R[]): [L, R][] {
// 	return this.pair<L, R>(left, right, left.length <= right.length ? left.length : right.length)
// }
// static longest<L, R>(left: L[], right: R[]): [L, R][] {
// 	return this.pair<L, R>(left, right, left.length >= right.length ? left.length : right.length)
// }

// function zipShortest<C, T, U>(left: Enumerable<C, T>, right: Enumerable<C, U>,
// 	: ): Enumerable<C, [T, U]> {
// 	/*
// 		[insert description of zip]
	

// 	A similar function can be expressed for Iterable, by first casting 
// 	everything to array (as in iterable_to_enumerable).
// 	*/
	

// }



export {
	IEnumerable, IEnumerator,
	Enumerable, Enumerator,
	array_to_enumerable, enumerable_to_array,
	find
}