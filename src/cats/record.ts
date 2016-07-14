/*
Record syntax is the x[i] syntax which is very common on container data types.
Records do not derive very many functions on their own, but are related to
two other heavily used core types - enumerable and mutablerecord.


@todo: Fill this in as-per template. Generic functions and all.
	THEN start looking at the utility functions
@todo: Have some 'is' functions that check the internal types.
	Actually... that probably requires 'Indexable'/'Enumerable'
 */

interface IRecord<C, T> {
	/*
	A Record is a type with index or key values - this includes arrays, dictionarys, 
	maps, and (in Javascript) objects.
	*/
	getitem(i: C): T;
}

abstract class Record<C, T> {
	abstract getitem(i: C): T;
	static is<C, T>(value: any): value is Record<C, T> {
		return (value.getitem instanceof Function)
	}
}

interface IMutableRecord<C, T> extends IRecord<C, T> {
	getitem(i: C): T;
	setitem(i: C, x: T): void;
	delitem(i: C): void;
}

abstract class MutableRecord<C, T> extends Record<C, T> {
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

interface IImmutableRecord<C, T> extends IRecord<C, T> {
	getitem(i: C): T;
	setitem(i: C, x: T): IImmutableRecord<C, T>;
	delitem(i: C): IImmutableRecord<C, T>;
}

abstract class ImmutableRecord<C, T> extends IRecord<C, T> {
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

export {
	IRecord,
	Record
}