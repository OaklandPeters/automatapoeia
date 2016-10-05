/**
 *
 */


/* Interfaces
======================== */
type Arguments = Array<any>;
interface IMorphism<A extends Arguments, B extends Arguments> extends Function {
	(a: A): B;
}

interface IComposable<A extends Arguments, B extends Arguments> extends IMorphism<A, B> {
	compose<C extends Arguments>(g: IComposable<B, C>): IComposable<A, C>;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Composable {
	// abstract compose<A extends Arguments, B extends Arguments, C extends Arguments>(
	// 	f: (a: A) => B, g: (b: B) => C): (a: A) => C;
	// static compose: <A extends Arguments, B extends Arguments, C extends Arguments>(
	// 	f: (a: A) => B, g: (b: B) => C) => (a: A) => C;
	static is(value: any): value is Composable {
		return ((value instanceof Function)
			&& (value.compose instanceof Function));
	}
}

/* Type-Guards: Type-checking functions
================================================= */
type Appender<T, V extends Appendable> = {
	append(other: V): V;
} & V;

/* Generic functions
for each abstract method
================================================ */
function compose(
	f: Function & Composable, g: Function & Composable): Function & Composable {
	return 
}

function append<T, U extends Appendable>(appendable: U, other: U): U {

function compose<A extends Arguments, B extends Arguments, C extends Arguments>(
	f: (a: A) => B,
	g: (b: B) => C,
	composable_category: {compose(f: (a: A) => B, g: (b: B) => C): ((a: A) => C)}
	): (a: A) => C {
	return composable_category.compose(f, g);
}



/* Laws
Assertion functions expressing something which must
be true about the category for it to be sensible, and
are part of its definition, but are not expressible
in the type-system.
================================================= */

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
var From = {
};

var To = {
};

/* Functors
convert between morphisms (~functions) of two categories.
==================================== */

/* Native versions
equivalents to this categories' method,
for built-in Javascript types
====================================== */
var Native = {
	Function: function compose<A extends Arguments, B extends Arguments, C extends Arguments>(
		f: (a: A) => B, g: (b: B) => C): (a: A) => C {
		return function composed(a: A): C {
			return g(f(a))
		}
	}
};

/* Exports
==================== */
export {
	IComposable, Composable,
	compose,
	Native
}
