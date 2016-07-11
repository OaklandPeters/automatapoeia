/*
Record syntax is the x[i] syntax which is very common on container data types.
Records do not derive very many functions on their own, but are related to
two other heavily used core types - enumerable and mutablerecord.
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

export {
	IRecord,
	Record
}