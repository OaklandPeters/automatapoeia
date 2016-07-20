


Short-term Goals
===================
Should advanced me toward the mid-term goal of manifold.


* Sized
* Indexable: Record + Iterable
** Generic funciton: enumerate() --> items(), keys(), Enumerator --> IndexIterator
** Utility function: enumerate
** Change references in other files
** THEN: retire current enumerable.ts


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
			Foldable
			Zeroable
		Appendable
	Traversable
		Bindable
			Mappable

	~ maybe Monoid
	~ maybe Space
	~ maybe Category
	~ maybe Monad


Long-term Desires
=======================
These are cool, but not really needed.

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