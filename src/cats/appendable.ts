/**
 * Append is the ability to combine two objects of the same type, combining
 * their information.
 *
 * Note: 'Append' is a stand-in for an associative binary operation. On
 * container data-types, this most commonly looks similar to an 'append'
 * operation. But does not have to be, and the data-types with an 'append'
 * are not necessarily containers. Hence, Appenable is not a generic.
 *
 * @TODO: Create a related function/interface for appending dissimlar types
 * -- to represent polymorphic containers (Python lists)
 * @todo: be sure to add shove to Monoid
 */
import {Liftable} from './liftable';
import {Zeroable} from './zeroable';


/* Interfaces
======================== */
interface IAppendable {
	append(other: IAppendable): IAppendable;
}


/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Appendable {
	abstract append(other: Appendable): Appendable;
	static is(value: any): value is Appendable {
		return (value.append instanceof Function);
	}
}


/* Typechecking functions
================================================= */
type Appender<T, V extends Appendable> = {
	append(other: V): V;
} & V;


/* Generic functions
for each abstract method
================================================ */
function append<T, U extends Appendable>(appendable: U, other: U): U {
	/* 
	Disclaimer: There should be other conditions attached to type 'other', but I don't know how to
	represent them in TypeScript

	Notice: the 'append' function can frequently give better type-checking behavior
	than directly using the .append() method on a class. For example, in the merge function:	
		let accumulator = base.zero();
		accumulator.append(base)   // infers type: Appendable
		append(accumulator, base)  // infers type: U

	*/
	return appendable.append(other) as U;
}


/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */


/* Metafunctions
Functions that modify or decorate morphisms in this category
============================================================== */

/* Constructors
convert between elements (~instances) of two categories
==================================== */

/* Functors
convert between morphisms (~functions) of two categories.
==================================== */

/* Native versions
equivalents to this categories' method,
for built-in Javascript types
====================================== */
interface ObjectLike extends Object {
	// Extend Builtin TypeScript Object to specify keys
	[key: string]: any;
}

var Native = {
	Number: (x: number , y: number) => x + y,
	String: (x: string, y: string) => x.concat(y),
	Array: <T>(x: Array<T>, y: Array<T>) => x.concat(y),
	Object: function<T extends ObjectLike, U extends ObjectLike>(x: T, y: U): T & U {
		let merged = {} as {
			[key: string]: any
		};
		for (let name in x) {
			merged[name] = x[name];
		}
	    for (var name in y) {
	    	merged[name] = y[name];
		}
		return merged as T & U;
	}
};


/* Exports
==================== */
export {
	IAppendable, Appendable, append
}
