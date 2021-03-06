/**
 * Indexable collections are iterable records, which have an
 * iterable index of keys.
 *    We except .iter() to return values and .keys() to return keys.
 * Although this is a heavily subjective decision, I will stick
 * to it for consistency.
 *
 * Iterable vs Enumerable: Enumerable is Iterable applied to Records --
 * data types with a concept of index or key. 
 * iter(): IterationResult<T>, while enum(): IterationResult<[KeyType, T]>
 */
import {IIterable, Iterable, forEach, filter, apply as applyToIterable} from './iterable';
import {IIterator, Iterator, From as IteratorFrom, range} from './iterator';
import {IterationResult, isNotDone, apply as applyIfNotDone} from './iteration_result';
import {IRecord, Record} from './record';
import {isEqual} from './equatable';


/* Interfaces
======================== */
type IItem<C, T> = [C, T];
interface IIndexable<C, T> extends IRecord<C, T>, IIterable<T> {
	keys(): IIterator<C>;
}


/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Indexable<C, T> extends Iterable<T> implements IIndexable<C, T> {
	abstract getitem(i: C): T;
	abstract keys(): Iterator<C>;
	static is<C, T>(value: any): value is Indexable<C, T> {
		return (
			Record.is<C, T>(value)
			&& Iterable.is<T>(value)
			&& (value.items instanceof Function)
			&& (value.keys instanceof Function)
		)
	}
	// Mixin methods
	iter(): Iterator<T> {
		let keysIterator = this.keys();
		let indexable = this;
		return {
			iter: function(){ return this },
			next: function(): IterationResult<T> {				
				return applyIfNotDone<C, T>(
					keysIterator.next(),
					(key) => indexable.getitem(key))
			}
		}
	}
}


/* Typechecking functions
================================================= */
function stringIsIndexable(_string: string): _string is string & IIndexable<number, string> {
	return true;
}


/* Generic functions
for each abstract method
================================================ */
function items<C, T>(indexable: Indexable<C, T>): Iterator<IItem<C, T>> {
	let keysIterator = indexable.keys();
	return {
		iter: function(){ return this },
		next: function(): IterationResult<[C, T]> {
			return applyIfNotDone<C, [C, T]>(
				keysIterator.next(),
				(key) => [key, indexable.getitem(key)])
		}
	}
}

function keys<C, T>(indexable: Indexable<C, T>): Iterator<C> {
	return indexable.keys()
}

/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */
function find<C, T>(indexable: Indexable<C, T>, target: T): Iterable<C> {
	/* Return all keys in indexable where the value is equal to target. */
	let filtered: Iterable<[C, T]> = filter<[C, T]>(
		items(indexable), ([key, value]) => isEqual(value, target)
	);
	return applyToIterable<[C, T], C>(filtered, ([key, value]: [C, T]) => key)
}



/* Constructors
to/from common data types
==================================== */
// Typescript's definition of Array and Object are missing a few things. 
// Array is missing the .keys() method - we use it in From.Array
// Object & Array are also missing type-information on their indexes.
// (which makes TS complain about implicit 'any' types)
interface Array<T> {
	keys(): Iterator<number>
	[propname: number]: T;
}
interface Object {
	[propname: string]: any;
}

// Indexable TO type X
var To = {
	Map: function<C, T>(indexable: Indexable<C, T>): Map<C, T> {
		let _map = new Map<C, T>();
		forEach<[C, T]>(items(indexable), ([key, value]) => _map.set(key, value))
		return _map
	}
}

// Indexable FROM type X
var From = {
	Array: class IndexableFromArray<T> extends Indexable<number, T> {
		constructor(public array: Array<T>){ super() }
		keys(): Iterator<number> { return this.array.keys() }
		getitem(i: number): T { return this.array[i] }
	},
	Object: class IndexableFromObject extends Indexable<string, any> {
		constructor(public data: Object){ super() }
		keys(): Iterator<string> {
			return IteratorFrom.Array<string>(Object.keys(this.data))
		}
		getitem(i: string): any { return this.data[i]}
	},
	String: class IndexableFromString extends Indexable<number, string> {
		constructor(public data: string) { super() }
		keys(): Iterator<number> { return range(this.data.length); }
		getitem(i: number): string { return this.data[i]; }
	}
}

/* Metafunctions and Functors
=================================== */


/* Exports
==================== */
export {
	IIndexable, Indexable,
	items, keys,
	To, From
}
