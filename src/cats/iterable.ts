/*
A Python-inspired take on iter() and Iterablility in Javascript.

Defines three heavily related categorical objects:
	Iterable, Iterator, and IterationResult

This is a non-ES6 Iterator - this doesn't use Symbol.iterator, because
that is not commonly supported at this time (07/10/2016).
Once Symbol.iterator
is supported in most browsers, this will be rewritten to match it.

An ES6 version of this hinges on 'forEach':
interface ForEachable<T> {
    forEach(callbackfn: (value: T) => void): void;
}
 */
import {Foldable, all, To as FoldableTo} from './foldable';
import {isEqual} from './equatable';
import {IIterator, Iterator, From as IteratorFrom, next} from './iterator'
import {IterationResult, apply as IterationResultApply, isNotDone} from './iteration_result';


/* Interfaces
======================== */
interface IIterable<T> {
	iter(): IIterator<T>;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Iterable<T> implements IIterable<T> {
	abstract iter(): Iterator<T>;
	static is<T>(value: any): value is Iterable<T> {
		return (value['is'] instanceof Function)
	}
}


/* Typechecking functions for IterationResult
================================================= */

/* Generic functions for Iterable and Iterator
================================================ */
function iter<T>(iterable: Iterable<T>): Iterator<T> {
	return iterable.iter();
}

function iterAs<T, Subject extends Base, Base extends Iterable<T>>(subject: Subject, base: {new(data: any): Base}): Iterator<T> {
	return base.prototype.iter.call(subject);
}

/* Derivable functions from Iterable/Iterator
================================================ */
function forEach<T>(iterable: Iterable<T>, action: (value: T) => void): void {
	let iterator = iter(iterable);
	while(true) {
		let element = next(iterator);
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
			let iterator = iter(iterable)
			return {
				iter: function() { return this },
				next: function(): IterationResult<T> {
					while(true) {
						let result = next(iterator)
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
	/* Does target occur inside iterable at all? */
	return (count<T>(iterable, target) >= 1)
}


/* Constructors for Iterable/Iterator
==================================== */
// Iterable TO type X
var To = {
	Array: function<T>(iterable: Iterable<T>): Array<T> {
		let accumulator: Array<T> = [];
		forEach(iterable, (value) => accumulator.push(value))
		return accumulator
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
var From = {
	Array: function<T>(array: Array<T>): Iterable<T> {
		return {iter: () => IteratorFrom.Array(array)}
	},
	Foldable: function<T>(foldable: Foldable<T>): Iterable<T> {
		return From.Array<T>(FoldableTo.Array<T>(foldable))
	}
}



/* Metafunctions and Functors
=================================== */
function apply<T, U>(iterable: Iterable<T>, f: (element: T) => U): Iterable<U> {
	/*
	This returns a bare object with only the methods implied by Iterable (iter).
	A better version could be written which makes use of 'Proxy' to make
	it behave just like the input, except for the 'iter' method -- but
	that would not be ES5-compatible (even with babel).
	*/
	return {
		iter: function(): Iterator<U> {
			let iterator = iter(iterable);
			return {
				iter: function(){ return this },
				next: function(): IterationResult<U> {
					return IterationResultApply<T, U>(next(iterator), f)
				}
			}
		}
	}
}


export {
	IIterable, Iterable,
	iter, iterAs,
	forEach, fold, filter, count, contains,
	To, From, apply
}
