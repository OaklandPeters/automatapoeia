/**
 * Indexable collections are iterable records, which have an
 * iterable index of keys.
 *    We except .iter() to return values and .keys() to return keys.
 * Although this is a heavily subjective decision, I will stick
 * to it for consistency.
 *
 */
import {IIterable, Iterable, IIterator, Iterator, IterationResult, isNotDone} from './iterable';
import {IRecord, Record} from './record';


/* Interfaces
======================== */
type IItem<C, T> = [C, T];
interface IIndexable<C, T> extends IRecord<C, T>, IIterable<T> {
	keys(): IIterator<C>;
	items(): IIterator<IItem<C, T>>;
}


/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Indexable<C, T> extends Record<C, T>, Iterable<T> implements IIndexable<C, T> {
	abstract getitem(i: C): T;
	abstract keys(): Iterator<C>;

	// Mixin methods
	iter(): Iterator<T> {
		let keysIterator = this.keys();
		return {
			iter: function(){ return this },
			next: function(){
				let keyResult = keysIterator.next();
				if (isNotDone<C>(keyResult)) {
					return {
						value: keyResult.value,
						done: false
					}
				} else {
					return {done: true}
				}

			}
		}
	}
	items(): Iterator<IItem<C, T>> {
		let keysIterator = this.keys();
		let indexable = this;
		return {
			// @todo: be sure 'this' refers to the iterator, and not the indexable
			iter: function(){ return this },
			next: function(){
				let keyResult = keysIterator.next();
				if (isNotDone<C>(keyResult)) {
					return {
						value: [keyResult.value, indexable.getitem(keyResult.value)],
						done: false
					}
				} else {
					return { done: true }
				}
			}
		}
	}
	abstract items(): Iterator<IItem<C, T>>;
	static is<C, T>(value: any): value is Indexed<C, T> {
		return (
			Record<C, T>.is(value)
			&& Iterable<T>.is(value)
			&& (value.items instanceof Function)
			&& (value.keys instanceof Function)
		)
	}
}


/* Typechecking functions
================================================= */


/* Generic functions
for each abstract method
================================================ */
function items<C, T>(indexable: Indexable<C, T>): Iterator<IItem<C, T>> {
	return indexable.items()
}

function keys<C, T>(indexable: Indexable<C, T>): Iterator<C> {
	return indexable.keys()
}

/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */

/* Functors
to/from common data types
==================================== */
var From = {
	Array: class IndexableFromArray<T> extends Indexable<number, T> {
		constructor(public array: Array<T>){}
		keys() {
			return this.array.keys()
		}
		getitem(i) {
			return this.array[i]
		}
	}

	// function<T>(array: Array<T>){}
}
// to/from array
// object
// Map


/* Exports
==================== */
export {
	IIndexable, Indexable,
	items, keys
}