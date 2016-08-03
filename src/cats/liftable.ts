/**
 * 'Liftable' corresponds to the concept of a generic 'container' that can
 * contain other data-types. You can take a single other variable, and 'lift'
 * it into the container.
 * 
 * Traditionally (IE in Haskell):
 * Lift implies a container than can contain any other type of variable,
 * and consequently, you can 'lift' *any* other single variable into that container.
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
 * You can't have static AND instance versions of method present on a single
 * interface. But this can be indirectly accomplished, by creating an interface
 * for the static version with the static method on it, and a new method
 * which returns an interface for the instance (with the instance version of
 * the method).
 *
 * ... in theory
 * ... in practice, this is causing me problems.
 *
 *
 * @TODO: Try this with duck-typing only, and not drawing the static-vs-instance distinction.
 * 	So, liftable is defined by having 'lift<U>(x: U): Liftable<U>'
 * 	... it can lift something, and that returns something also liftable
 */


/* Interfaces
======================== */
// Instance side
interface ILiftable<T> {
	lift<U>(value: U): ILiftable<U>;
}
// Static side
declare var ILiftable: {
	lift<U>(value: U): ILiftable<U>;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Liftable<T> implements ILiftable<T> {
	/*
	Disclaimer: There is presently no way in typescript to state that the return
	type of lift (static or instance) should be the same type as the class it's called
	on, but with the generic parameter <U>  (IE   'this<U>'). This feature may be
	coming in the future with higher-kinded types: https://github.com/Microsoft/TypeScript/issues/1213
	 */
	abstract lift<U>(value: U): Liftable<U>;
	static lift: <U>(value: U) => Liftable<U>;
	static is<T>(value: any): value is Liftable<T> {
		return (value.lift instanceof Function)
	}
}


/* Typechecking functions
================================================= */



/* Generic functions
================================================ */
// function lift<T extends Liftable<U>, U>(klass: {new(x: U): T, lift(x:U): T}, x: U): T {
function lift<T extends Liftable<U>, U>(liftable: {lift(x:U): T}, x: U): T {
	return liftable.lift(x)
}


/* Derivable functions
these are the real stars of the show - as these functions are
implied from the interfaces, and hence things you get "for free"
========================================================== */

/* Constructors
to/from common data types
==================================== */


/* Exports
==================== */
export {
	ILiftable, Liftable,
	lift
}
