/*
A Python-inspired take on iter() and Iterablility in Javascript.

This is a non-ES6 Iterator - this doesn't use Symbol.iterator, because
that is not commonly supported at this time (07/10/2016).
Once Symbol.iterator
is supported in most browsers, this will be rewritten to match it.

An ES6 version of this hinges on 'forEach':
interface ForEachable<T> {
    forEach(callbackfn: (value: T) => void): void;
}

Iterable vs Enumerable: Enumerable is Iterable applied to Records --
data types with a concept of index or key. 
iter(): IterationResult<T>, while enum(): IterationResult<[KeyType, T]>
 */
import {Foldable, all} from './foldable';
import {isEqual} from './equatable';
// import {From as EnumerableFrom, Enumerable} from './enumerable';
import {From as EnumerableFrom, Enumerable} from './enumerable';
import {To as IterableTo} from './iterable';


/* Interfaces */
interface IIterable<T> {
	iter(): IIterator<T>;
}

interface IIterator<T> {
	next(): IterationResult<T>
}

// IterationResult is already defined in TypeScript, via ES6 collections
// I'm defining this a bit differently - as a union type, to aid type-guards.
type IterationResult<T> = IterationDone<T> | IterationValue<T>;

// IterationDone/IterationValue specified as classes rather than interface
// so 'done' can be explicitly specified.
class IterationDone<T> {
	done = true;
}

class IterationValue<T> {
	done = false;
	value: T;
}

/* Abstract Base Classes, with 'is' type-checking static method */
abstract class Iterable<T> implements IIterable<T> {
	abstract iter(): Iterator<T>;
	static is<T>(value: any): value is Iterable<T> {
		return (value['is'] instanceof Function)
	}
}

abstract class Iterator<T> implements IIterator<T> {
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

/* Typechecking functions for IterationResult
================================================= */
function isDone<T>(value: IterationResult<T>): value is IterationDone<T> {
	return Boolean(value.done)
}

function isNotDone<T>(value: IterationResult<T>): value is IterationValue<T> {
	return (!Boolean(value.done));
}

/* Generic functions for Iterable and Iterator
================================================ */
function iter<T>(iterable: Iterable<T>): Iterator<T> {
	return iterable.iter();
}

function iterAs<T, Subject extends Base, Base extends Iterable<T>>(subject: Subject, base: {new(data: any): Base}): Iterator<T> {
	return base.prototype.iter.call(subject);
}

function next<T>(iterator: Iterator<T>): IterationResult<T> {
	return iterator.next();
}

/* Derivable functions from Iterable/Iterator
================================================ */
function forEach<T>(iterable: Iterable<T>, action: (value: T) => void): void {
	let iterator = iterable.iter();
	while(true) {
		let element = iterator.next();
		if (isNotDone<T>(element)) {
			action(element.value)
		} else {
			break
		}
	}
}

function fold<T, U>(iterable: Iterable<T>,
	folder: (accumulator: U, element: T) => U,
	initial: U
	): U {
	/* Preform a fold on an iterable. */
	let accumulator = initial;
	forEach(iterable, (value) => (accumulator = folder(accumulator, value)))
	return accumulator;
}


function filter<T>(iterable: Iterable<T>, predicate: (value: T) => boolean): Iterable<T> {
	return {
		iter: function(): Iterator<T> {
			let iterator = iterable.iter()
			return {
				iter: function() { return this },
				next: function(): IterationResult<T> {
					while(true) {
						let result = iterator.next()
						if (isNotDone<T>(result)) {
							// For IterationValue - filter out ones that don't meet predicate
							if(predicate(result.value)) {
								return result;
							} else {
								continue;
							}
						} else {
							// Return the IterationDone result
							return result
						}
					}
				}
			}
		}
	}
}

function count<T>(iterable: Iterable<T>, target: T): number {
	/* Count number of occurences of target in iterable. */
	return fold<T, number>(
		iterable,
		(acc, elm) => isEqual(target, elm) ? acc + 1 : acc,
		0
	)

}

function contains<T>(iterable: Iterable<T>, target: T): boolean {
	/* Does target occur inside iterable. */
	return (count<T>(iterable, target) >= 1)
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
	let iterators = iterables.map<Iterator<T>>((value: Iterable<T>) => value.iter());
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
				(_iter: Iterator<T>) => _iter.next());

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
			return {done: false}
		} else {
			let value = this.data[this.counter];
			this.counter = this.counter + 1;
			return {value: value, done: true};
		}
	}
}

/* Constructors for Iterable/Iterator
==================================== */
// Iterable TO type X
var IterableTo = {
	Array: function<T>(iterable: Iterable<T>): Array<T> {
		let accumulator: Array<T> = [];
		forEach(iterable, (value) => accumulator.push(value))
		return accumulator
	},
	Enumerable: function<T>(iterable: Iterable<T>): Enumerable<number, T> {
		return EnumerableFrom.Array<T>(IterableTo.Array<T>(iterable))
	},
	Foldable: class IterableToFoldable<T> extends Foldable<T> {
		constructor(protected iterable: Iterable<T>) {
			super()
		}
		fold<U>(folder: (accumulator: U, element: T) => U, initial: U): U {
			return fold<T, U>(this.iterable, folder, initial)
		}
	}
}

// Iterable FROM type X
var IterableFrom = {
	Array: function<T>(array: Array<T>): Iterable<T> {
		return {iter: () => IteratorFrom.Array(array)}
	}
}

var IteratorTo = {
	Array: function<T>(iterator: Iterator<T>): Array<T> {
		let accumulator = new Array();
		forEach(iterator, (value) => accumulator.push())
		return accumulator
	}
}

var IteratorFrom = {
	Array: function<T>(array: Array<T>): Iterator<T> {
		return new ArrayIterator<T>(array);
	}
}




export {
	IIterable, IIterator,
	Iterable, Iterator,
	IterationResult, IterationValue, IterationDone, isDone, isNotDone,
	iter, iterAs, next,
	forEach, fold,
	IterableTo, IterableFrom, IteratorTo, IteratorFrom
	ArrayIterator,
	count, contains,
	zip, zipLongest
}