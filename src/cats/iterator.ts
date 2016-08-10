import {IIterable, Iterable, forEach, iter, fold as foldIterable} from './iterable';
import {IterationResult, IterationValue, IterationDone, apply as applyIfNotDone, isNotDone} from './iteration_result';

/* Interfaces
======================== */
interface IIterator<T> extends IIterable<T> {
	/* Iterators encapsulate the state for iterating across an
	iterable collection. Iterators also themselves count as iterable
	(their 'iter' method just returns the iterable)
	*/
	next(): IterationResult<T>
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Iterator<T> implements IIterator<T>, IIterable<T> {
	/* Iterators are themselves Iterable.
	 */
	abstract next(): IterationResult<T>;
	iter(): Iterator<T> {
		return this;
	}
	static is<T>(value: any): value is Iterator<T> {
		return (value.next instanceof Function)
	}
}

/* Typechecking functions
================================================= */


/* Generic functions
for each abstract method
================================================ */
function next<T>(iterator: Iterator<T>): IterationResult<T> {
	return iterator.next();
}

/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */
class ArrayIterator<T> extends Iterator<T> {
	/* Iterable to Array */
	data: Array<T>;
	done: boolean;
	counter: number;
	iterator: Iterator<T>;

	constructor(data: Array<T>) {
		super();
		this.data = data;
		this.done = false;
		this.counter = 0;
	}

	next(): IterationResult<T> {
		if (this.counter >= this.data.length) {
			return {done: true}
		} else {
			let value = this.data[this.counter];
			this.counter = this.counter + 1;
			return {value: value, done: false};
		}
	}
}

class RangeIterator extends Iterator<number> {
	/*
	 */
	counter: number;

	constructor(public stop: number, public start: number = 0, public step: number = 1) {
		super();
		this.counter = this.start;
	}

	next(): IterationResult<number> {
		let current = this.counter;
		this.counter = this.counter + this.step;
		if (current >= this.stop) {
			return {done: true};
		} else {
			return {done: false, value: current};
		}
	}
}

function range(stop: number, start: number = 0, step: number = 1): Iterator<number> {
	return new RangeIterator(stop, start, step)
}

function allDone<T>(results: Array<IterationResult<T>>): results is Array<IterationValue<T>> {
	return results.every(
		(_result: IterationResult<T>) => isNotDone<T>(_result));
}

function zip<T>(iterables: Array<Iterable<T>>): Iterator<Array<T>> {
	/* Aggregate multiple iterables into a single iterable. Stops iterating
	when the shortest iterable is exhausted. See 'zipLongest' for a version
	which pads the shorter iterables.
	*/
	let iterators = iterables.map<Iterator<T>>((value: Iterable<T>) => iter(value));
	return {
		iter: function(){ return this },
		next: function(): IterationResult<Array<T>> {
			let results = iterators.map<IterationResult<T>>(
				(_iter: Iterator<T>) => _iter.next());
			if (allDone<T>(results)) {
				return {
					done: false,
					value: results.map<T>((_result: IterationValue<T>) => _result.value)
				}
			} else {
				return {
					done: true
				}
			}
		}
	}
}

function zipLongest<T, U>(iterables: Array<Iterable<T>>, filler: U = undefined): Iterator<Array<T|U>> {
	let iterators = iterables.map<Iterator<T>>((value: Iterable<T>) => value.iter());
	return {
		iter: function(){ return this },
		next: function(): IterationResult<Array<T>> {
			let results = iterators.map<IterationResult<T>>(
				(_iter: Iterator<T>) => next(_iter));
			let anyDone = false;
			let values = results.map<T|U>(
				function(_result: IterationResult<T>): T|U {
					if (isNotDone<T>(_result)) {
						anyDone = true;
						return _result.value;
					} else {
						return filler;
					}
				}
			)
			if (anyDone) {
				return {
					done: false,
					value: values
				}
			} else {
				return {done: true}
			}
		}
	}
}

function enumerate<T>(iterable: Iterable<T>): Iterator<[number, T]> {
	let iterator = iter(iterable);
	let count = 0;
	return {
		iter: function(){ return this },
		next: function(): IterationResult<[number, T]> {
			let result = applyIfNotDone<T, [number, T]>(
				next(iterator), (value: T) => [count, value]);
			count = count + 1;
			return result;
		}
	}
}



/* Metafunctions
Functions that modify or decorate morphisms in this category
============================================================== */
function apply<T, U>(iterator: Iterator<T>, f: (element: T) => U): Iterator<U> {
	/* The 'apply' metafunction on morphisms in the category of Iterators. */
	return {
		iter: function(){ return this },
		next: function(): IterationResult<U> {
			return applyIfNotDone<T, U>(next(iterator), f)
		}
	}
}

/* Constructors
convert between elements (~instances) of two categories
==================================== */
import {Foldable, fold} from './foldable';

var To = {
	Array: function iteratorToArray<T>(iterator: Iterator<T>): Array<T> {
		let accumulator = new Array();
		forEach(iterator, (value) => accumulator.push())
		return accumulator
	},
	Foldable: function iteratorToFoldable<T>(iterator: Iterator<T>): Foldable<T> {
		return {
			fold: function foldIterator<U>(f: (accumulator: U, element: T) => U, initial: U): U {
				return foldIterable<T, U>(iterator, f, initial)
			}
		}
	}
}

var From = {
	Array: function<T>(array: Array<T>): Iterator<T> {
		return new ArrayIterator<T>(array);
	}
}


/* Functors
convert between morphisms (~functions) of two categories.
==================================== */

/* Exports
==================== */
export {
	IIterator, Iterator, next,
	ArrayIterator,
	zip, zipLongest, enumerate,
	To, From, apply,
	RangeIterator, range
}
