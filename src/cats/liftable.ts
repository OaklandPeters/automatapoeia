/**
 * 
 * Traditionally:
 * Lift implies a container than can contain any other type of variable,
 * and consequently, you can 'lift' any other single variable into that container.
 * For example, all monads in Haskell are these 'universally' Liftable containers.
 * In category-theory terms, traditional liftable would be a type of universal functor.
 *
 * Bounded Liftable categories are very much possible, they are just less commonly
 * used in containers and Haskell-like monads.
 * 
 *
 * Using Class Types in Generics
 * ----------------------------------
 * In TypeScript, when you need to pass a class as a parameter,
 * you have to refer to the class via it's constructor functions.
 * 
 */





interface IBoundedLiftable<Bound, T extends Bound> {

}

function makeBoundedLiftable<Bound>() {
	abstract class BoundedLiftable<T> {

	}	
}





/* Interfaces
======================== */
interface ILiftable<T> {
	/* Static version of the liftable interface.
	The 'lift' function should be available on both the class and the instances.
	 */
	lift<U>(value: U): ILifted<U>;
	new(x: T): ILifted<T>;
}
interface ILifted<T> {
	lift<U>(value: U): ILifted<U>;
}


// experimenting with whether I can put all of this info into one interface
interface _ILiftable<T> {
	lift<U>(value: U): _ILiftable<U>;
	new(x: T): _ILiftable<T>;
}

class List<T> implements _ILiftable<T> {
	protected data: Array<T>;
	constructor(value: T) { this.data = [value];}
	static lift<U>(value: U): List<U> {
		return new List<U>(value);
	}
	lift<U>(value: U): List<U> {
		return new List<U>(value);
	}
}



/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Liftable<T> {
	/* 'lift' should be available on the class, and on the instances. */

	static lift: <U>(value: U) => Liftable<U>;	
	abstract lift<U>(value: U): Liftable<U>;

	static is<T>(value: any): value is Liftable<T> {
		return (value.lift instanceof Function)
	}
}


// abstract class Lift<T> {
// 	static lift: <U>(value: U) => Lift<U>;
// 	lift: <U>(value: U) => Lift<U>;
// }


/* Typechecking functions
================================================= */


/* Generic functions
for each abstract method
================================================ */
// interface Liftable<T> {
// 	new: (x: T) => Liftable<T>;
// 	lift: <U>(x: U) => Liftable<U>;
// }

function lift<T extends Liftable<U>, U>(klass: {new(x: U): T, lift(x:U): T}, x: U): T {
	return klass.lift(x)
}


/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */

/* Functors
to/from common data types
==================================== */

/* Exports
==================== */
export {

}
