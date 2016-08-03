Short-term Goals
===================
Should advanced me toward the mid-term goal of manifold.


* monoid
** interaction with foldable --> translate/build-up
** Monoid + Foldable --> Traversable

Misc
---------
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

Optional Goals
===================
'Natural' version of generic function: new section for template, and organization for existing categories.
Applies the generic function to built-in Javascript data-types
* This ~might~ be best implemented with the To/From converters.
* Array: foldable, zeroable, reducable, appendable, liftable, joinable, monoid, sized
* Object: foldable, reducable, joina


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
