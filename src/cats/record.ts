/*
A Record is a type with index or key values - this includes arrays, dictionarys, 
maps, and (in Javascript) objects.


Record syntax is the x[i] syntax which is very common on container data types.
Records do not derive very many functions on their own, but are related to
two other heavily used core types - enumerable and mutablerecord.

Almost all Records will provide Iterable and Enumerable as well, because
its difficult to image practical records where you can retreieve based
on indices, but do not have a way to iterate across all possible indices.


@todo: Fill this in as-per template. Generic functions and all.
	THEN start looking at the utility functions
@todo: Have some 'is' functions that check the internal types.
	Actually... that probably requires 'Indexable'/'Enumerable'
 */
import {ILiftable, Liftable} from './liftable';


/* Interfaces
======================== */
interface IRecord<C, T> {
	getitem(i: C): T;
}

interface IMutableRecord<C, T> extends IRecord<C, T> {
	getitem(i: C): T;
	setitem(i: C, x: T): void;
	delitem(i: C): void;
}



interface IImmutableRecord<C, T> extends IRecord<C, T> {
	getitem(i: C): T;
	setitem(i: C, x: T): IImmutableRecord<C, T>;
	delitem(i: C): IImmutableRecord<C, T>;
}

/* Abstract Base Classes
========================================= */
abstract class Record<C, T> {
	abstract getitem(i: C): T;
	static is<C, T>(value: any): value is Record<C, T> {
		return (value.getitem instanceof Function)
	}
}

abstract class MutableRecord<C, T> extends Record<C, T> implements IMutableRecord<C, T> {
	abstract getitem(i: C): T;
	abstract setitem(i: C, x: T): void;
	abstract delitem(i: C): void;
	static is<C, T>(value: any): value is MutableRecord<C, T> {
		return ((value.getitem instanceof Function)
			&&  (value.setitem instanceof Function)
			&&  (value.delitem instanceof Function)
		);
	}
}

abstract class ImmutableRecord<C, T> extends Record<C, T> implements IImmutableRecord<C, T> {
	abstract getitem(i: C): T;
	abstract setitem(i: C, x: T): IImmutableRecord<C, T>;
	abstract delitem(i: C): IImmutableRecord<C, T>;
	static is<C, T>(value: any): value is ImmutableRecord<C, T> {
		return ((value.getitem instanceof Function)
			&&  (value.setitem instanceof Function)
			&&  (value.delitem instanceof Function)
		);
	}
}

/* Typechecking functions
================================================= */


/* Generic functions
for each abstract method
================================================ */
function getitem<C, T>(record: IRecord<C, T>, index: C): T {
	return record.getitem(index)
}

function setitem<C, T, R extends IMutableRecord<C, T> | IImmutableRecord<C, T>>(record: R, index: C, value: T): void | R {
	return record.setitem(index, value)
}

function delitem<C, T, R extends IMutableRecord<C, T> | IImmutableRecord<C, T>>(record: R, index: C): void | R {
	return record.delitem(index)
}

/* Derivable functions
========================================================== */
// Very little is derivable from record syntax alone, but many functions are
// derivable once other categories are mixed in, see sequence


/* Functors
==================================== */


/* Exports
==================== */
export {
	IRecord, Record,
	IMutableRecord, MutableRecord,
	IImmutableRecord, ImmutableRecord,
	getitem, setitem, delitem
}