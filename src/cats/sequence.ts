/*

Record + Iterability properties.


@todo: ImmutableSequence needs to be liftable
 */
import {ILiftable, Liftable} from './liftable';


/* Interfaces
======================== */
// Iterable
// Foldable
// Record
// Indexed
interface ISequence<T> {
	
}

interface IMutableSequence<T> {

}

interface IImmutableSequence<T> {

}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Sequence<T> implements ISequence<T> {

}

abstract class MutableSequence<T> implements IMutableSequence<T> {

}

abstract class ImmutableSequence<T> implements IImmutableSequence<T> {

}


/* Typechecking functions
================================================= */


/* Generic functions
for each abstract method
================================================ */


/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */
// function sort(sequence)


/* Functors
to/from common data types
==================================== */
// function array_to_mutable_sequence
// function mutable_sequence_to_array
// 


/* Exports
==================== */
export {
	ISequence, Sequence,
	IMutableSequence, MutableSequence,
	IImmutableSequence, ImmutableSequence
}



// for comparison, this is a Pythonic MutableSequence
abstract class Sequence<C, T> {
	/*
	Note - generalizing this to higher-dimension is... complex.
		len --> sizes & dimension
		Basically, conversion of things expecting index into path
	@todo: translate these into more Javascript-y category functions.
		map, etc

	Updated Methods
	-------------------
	len(): number --> sizes(): Array<number>
	iter(): enumerate(): Array<C, T>
	... with these two, I can derive iter()
	index(x: T, begin=0, end=this.len()): C --> find(x: T): Array<C>

	New/Enhanced Methods
	-----------------------
	equal(other:)
	copy()
	fold/map/traverse
	literal()

	 */
	abstract iter(): Array<T>;
	abstract getitem(i: C): T;
	abstract len(): number;

	// Mixin methods
	enumerate: () => Array<[C, T]>;
	getitem: (i: C) => T;

	index(x: T): Array<C> {
		return this.enumerate()
				   .filter(([key, value]: [C, T]) => (value === x))
				   .map(([key, value]: [C, T]) => key)
	}
	count(x: T): number {
		return this.index(x).length;
	}
	contains(x: T): boolean {
		return this.count(x) > 0;
	}


	// Not sure if I need these
	reversed(): MutableSequence<C, T>;
}


abstract class MutableSequence<C, T> extends Sequence<C, T> {
	/*
	Decision?  Immutable or mutable. Affects return type of setitem, delitem, insert.
	--> Sequence, MutableSequence, ImmutableSequence

	Updated Methods
	--------------------
	append(x: T): void   			-->   push(x: T): void;
	extend(mx: Iterable<T>): void   -->   append(mx: Iterable<T>): void;
	pop(i: C=-1): T  --> pop(i: C = last(this))
		something with a meaningful sense of first/rest/front/last


	*/
	abstract setitem(i: C, x: T): void;
	abstract delitem(i: C): void;
	abstract insert(i: C, x: T): void;
	// Mixin methods
	append(x: T): void;
	extend(mx: Iterable<T>): void;
	// Not sure if I need these
	reverse(): void;	// reverses in place
	pop(i: C=-1): T
	remove(x: T): void;
}
