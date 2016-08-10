Short-term Goals
===================
Should advanced me toward the mid-term goal of manifold.

* monoid
** interaction with foldable --> translate/build-up
** Monoid + Foldable --> Traversable

* Clean up joinable to be distinct from monoid

Clear up this category distinction
----------------------------------
Monoid := zeroable, equatable, appendable
Joinable := foldable, zeroable, equatable, reducible, appendable, joinable
		 ~= Monoid + Foldable
		 --> merge
Foldable := Joinable + Liftable + Typecheckable   (for the guard condition)
		--> shove

Foldable
----------
* add: function shove<T>(
	appendable: Appendable<T> & {lift: <U>(value: U) => Appendable<U>},
	element: T): Appendable<T>{
	/* Add a single element into an appendable container.
	This is similar to an immutable version of Javascript's Array.push() method. */
	return appendable.lift<T>(element);
}
function merge<T, U extends Appendable<T> & {zero: () => U}>(
// function merge<T, U extends {append: (other: U) => U, zero: () => U}>(
	base: U, ...appendables: Array<U>): U {
	/*
	 */
	return appendables.reduce(
		(accumulator: U, element: U) => append(accumulator, element),
		append(base.zero(), base)
	)

}

Iterable/Iterator
------------------
* range: range(stop), range(start, stop), range(start, stop, step) : Iterator<number>
** Beware the arguments bug

Misc
---------
* iterable.ts: To.Foldable - make this not a class, but return an object literal
* Add 'isFoldableOf<T>(value, foldClass, innerClass) => value is T' function to Foldable that checks inner data type
* If I write Monoid, then creative 'native' monoid versions for number, array

Examples / Conversations
--------------------------
* string versions for fold, reduce, and monoid


Mid-term Target Goal
========================
Complete dependencies for Manifold

Manifold
	ImmutableVector
		Vector
			Sequence
		ImmutableSequence
	Joinable
		Reducable
		Appendable
	Traversable
		Bindable
			Mappable

	~ maybe Monoid
		Derived functions: shove, functions for appending between types
	~ maybe Space
	~ maybe Category
	~ maybe Monad


Optional Goals: More parts to the template
=============================================
* 'Natural' version of generic function: new section for template, and organization for existing categories.
Applies the generic function to built-in Javascript data-types
** This ~might~ be best implemented with the To/From converters.
** Array: foldable, zeroable, reducable, appendable, liftable, joinable, monoid, sized
** Object: foldable, reducable, joina

* 'Laws' - functions which express or check a law which must apply to the category. These are for rules that are not expressible in the type-system.


Long-term Desires
=======================
These are cool, but not really needed.

Use one or more of: liftable/monoid/traversable (in the signature) to make apply, fmap functions for:
* example: apply<T, U extends Foldable<T> & Monoid<T>>(foldable: U): U
* iterable, iterator - fmap
* foldable
* sequence

Utility functions in categories (list here):
* All Python builtins
* Itertools methods
* Itertools cookbook
* Methods on list
* Methods on dict
* Methods on set
* Methods on str, utility functions in String module
* Derivable ABC methods on Set, MutableSet, Mapping, MutableMapping, Sequence, MutableSequence

* Categorical 'Mask' masks for core data-types. Basically provide the core suite of category-theory friendly methods: fold, equal, map, identity, etc
** For: Object, Map, WeakMap, Set, WeakSet, Array, Date, Boolean, String, etc

Category-friendly JS 'Native' Categories.
Expresses the category-theoretic interfaces and methods, but closely corresponds to JS-native classes.
* Number: Monoid NOT Foldable NOT Liftable
* Array: Monoid AND Foldable AND Liftable
* String: Monoid AND Foldable NOT Liftable

Proxy-Object Enhancements
---------------------------
This will only work once proxy objects are included (late ES6). But, for the various constructors and converters (I've written these for most categories), I'll return an
object with the correct methods. This would be better handled via a proxy around the
object which was passed in.
