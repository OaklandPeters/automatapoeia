/**
 * 
 * 
 * Defines an empty or null element of a category.
 * This 'Zero' element has meaning relative to the 'Append' function,
 * as used by the Monoid category, which obeys the following rule:
 *   function MonoidLaw<M extends Monoid>(monoid: Class<M>){
 *       let x = new SomeMonoid()
 *       let y = x.append(SomeMonoid.zero())
 *       assert(x == y)
 *       let z = SomeMonoid.zero().append(x)
 *       assert(x == z)
 *   }
 *
 * @todo: create a version of isZeroable that accounts for native types
 */
import {IEquatable, Equatable} from './equatable';
import {Class} from './cat_support';


/* Interfaces
======================== */
interface IZeroable extends Equatable {
	zero(): IZeroable;
} declare var IZeroable: {
	zero(): IZeroable;
}


/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Zeroable implements IZeroable {
	/*
	For convenience, we expect the 'zero' function to be expressed
	as both a static and instance method.
	 */
	abstract equal(other: any): boolean;
	abstract zero(): Zeroable;
	static zero:() => Zeroable;
	static is(value: any): value is Zeroable {
		return ((value.zero instanceof Function)
			&& (value.equal instanceof Function))
	}
}

/* Typechecking functions
================================================= */
function isZeroable(value: any): value is Zeroable {
	return ((value.zero instanceof Function)
		&& (value.equal instanceof Function))
}


/* Generic functions
for each abstract method
================================================ */
// function zero<Z extends Zeroable>(zeroable: Z): Z {
// 	return zeroable.zero();
// }
function zero<T>(zeroable: {zero: () => T}): T {
	return zeroable.zero() as T;
}


/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */
function isTruthy<Z extends Zeroable>(value: any, base: Class<Z>): boolean {
	/*
	Zeroable defines a rigorous notion of 'False'/'Empty'
	*/
	if (Zeroable.is(value)) {
		return (value === value.zero())
	} else {
		return Boolean(value)
	}
}

// Built-in data types which have a concept of 'zero', but no 'zero' method
type NativelyZeroable = number | string | Array<any> | boolean | Map<any, any>;

function isNativelyZeroable<T>(value: T): value is T & NativelyZeroable {
	if (   (typeof value === 'number')
		|| (typeof value === 'string')
		|| (typeof value === 'boolean')
		|| (value instanceof Array)
		|| (value instanceof Map) ){
		return true
	} else {
		return false;
	}
}

function nativeZero<T extends NativelyZeroable>(x: T): T {
	if (typeof x === 'number') {
		return 0 as any as T
	} else if (typeof x === 'string') {
		return "" as any as T
	} else if (typeof x === 'boolean') {
		return false as any as T
	} else if (x instanceof Array) {
		return [] as any as T
	} else if (x instanceof Map) {
		return new Map() as any as T;
	} else {
		throw "Variable is not a zeroable native-Javascript type: "+String(x);
	}
}

function zeroOf<T extends NativelyZeroable | Zeroable>(x: T): T {
	/*
	Return the zero value of some instance or class, much like the
	'zero' function, but with support for 'native' zeroable classes.
	The generic parameter on this function is inferred by Typescript,
	so this function will return the same type as it is passed in.
	Convincing Typescript to accept this takes a lot of casting.
	 */
	if (Zeroable.is(x)) {
		return (x as any as Zeroable).zero() as any as T
	} else if (isNativelyZeroable(x)) {
		return nativeZero(x);
	} else {
		throw "Variable is not zeroable: "+String(x)
	}
}

function isZero<Z extends IZeroable>(x: any): boolean {
	if (Zeroable.is(x)) {
		return x.zero().equal(x)
	} else {
		return false
	}
}

function isZeroOf<Z extends IZeroable>(x: any, zeroable: Class<Z> & {zero: () => Z}): boolean {
	return (zeroable.zero().equal(x))
}


/* Constructors
to/from common data types
==================================== */

/* Exports
==================== */
export {
	IZeroable, Zeroable, isZeroable, zero,
	isTruthy,
	NativelyZeroable, isNativelyZeroable, nativeZero, zeroOf,
	isZero, isZeroOf
}





