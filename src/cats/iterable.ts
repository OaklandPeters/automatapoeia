/*
A Python-inspired take on iter() and Iterablility in Javascript.


Non-ES6 Iterator - this doesn't use Symbol.iterator, because that is
not commonly supported at this time (07/10/2016). Once Symbol.iterator
is supported in most browsers, this will be rewritten to match it.


Iterable vs Enumerable: Enumerable is Iterable applied to Records --
data types with a concept of index or key. 
iter(): IterationResult<T>, while enum(): IterationResult<[KeyType, T]>
 */
import {Foldable} from './foldable';
import {isEqual} from './cat_support';
import {array_to_enumerable} from './enumerable';


/* Interfaces */
interface IIterable<T> {
	iter(): IIterator<T>;
}

interface IIterator<T> {
	next(): IterationResult<T>
}

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
	return 
}

/* Derivable functions from Iterable/Iterator
================================================ */
function forLoop<T>(iterable: Iterable<T>, action: (value: T) => void): void {
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


function filter<T>(iterable: Iterable<T>, predicate: (T) => boolean): Iterable<T> {
	let iterator = iterable.iter()
	let new_iterator = {
		next: function(): IterationResult<T> {
			while(true) {
				let result = iterator.next()
				if (isNotDone<T>(result)) {
					if(predicate(result.value)) {
						return result;
					} else {
						continue;
					}
				} else {
					break
				}
			}
		}
	} as Iterator<T>
	return {iter: () => new_iterator} as Iterable<T>
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



/* Functors for Iterable/Iterator
==================================== */
function iterable_to_array<T>(iterable: Iterable<T>): Array<T>{
	/* Functor translating an iterable to an array. */
	let accumulator: Array<T> = [];
	forLoop(iterable, (value) => accumulator.push(value))
	return accumulator
}

function array_to_iterable<T>(array: Array<T>): Iterable<T> {
	return {iter: () => new ArrayIterator<T>(array)}
}

function iterable_to_enumerable<T>(iterable: Iterable<T>): Enumerable<number, T> {
	return array_to_enumerable<T>(iterable_to_array<T>(iterable))
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

function fold<T, U>(iterable: Iterable<T>,
	folder: (accumulator: U, element: T) => U,
	initial: U
	): U {
	let accumulator = initial;
	forLoop(iterable, (value) => (accumulator = folder(accumulator, value)))
	return accumulator;
}


class IterableToFoldable<T> extends Foldable<T> {
	constructor(protected iterable: Iterable<T>) {
		super()
	}
	fold<U>(folder: (accumulator: U, element: T) => U, initial: U): U {
		return fold<T, U>(this.iterable, folder, initial)
	}
}

function zip<C, T, U>(){
	
}


export {
	IIterable, IIterator,
	Iterable, Iterator,
	IterationResult, IterationValue, IterationDone, isDone, isNotDone,
	iter, next,
	forLoop,
	iterable_to_array, ArrayIterator, fold, IterableToFoldable,
	count, contains
}