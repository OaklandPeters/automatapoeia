Short-term Goals
===================
Should advanced me toward the mid-term goal of manifold.


Function-Based Types
==========================

Callable
--------------


Morphism
---------------
Fancy function. Can be invoked as a JS function, but also has attributes and methods.
Morphism = Callable & Function
Basically always, we will want 'Morphism in category X', but I realize it isn't actually logically required.


Identifiable
--------------

Composable
-------------
* This might be called 'Apply' in the Haskell community

Category
-------------------
* Category = Identifiable + Composable
* Add note - category doesn't actually say anything about the ability to apply those functions
* Nor does it say anything about making VALUES equatable
* This may or may not need a notion of domain to be comprehensible
* 'constant': Derived function: constant(a) -> f(x)=a for all x in domain
** function constant<A extends Domain, X extends Domain>(a: A): (x: X)=>A { return function _constant(x){ return a; }}

Add some notes somewhere on this equivalence
------------------------------------------------
Data-structures              Functions
   zeroable                     identifiable 
   liftable                     morphism
   appendable                   composoable
   monoid                       category
   foldable                     callable
   monad                        ??? (arrow maybe)
 

Applicative
-------------
* I haven't thought about this yet


Functor Stack of Categories
==============================
Builds on Callable, Morphism, Category, Functor - and then works toward Monad

Mappable
------------------
* Describe: this is similar to a subset of foldable:
** If foldable is:          fold(F<T>, f:(U, T) => U, initial:U) => U
** Actually reducable is:   reduce(F<T>, f:(F<T>, T) => F<T>) => U
** Iterable: 
* Utility function: wrap(f: (d_value: T) => U): (c_value: M<T>) => M<U>

Functor
------------------
Mappable plus a few more properties.
* Functor = Mappable + Category + laws
* Functor laws here: https://hackage.haskell.org/package/base-4.9.0.0/docs/Data-Functor.html
* Explain that this is basically 'Monoid' for functions
* Functor laws:
** fmap id  ==  id
** fmap (f . g)  ==  fmap f . fmap g

Applicative
--------------------
Not sure if I'm going to build this or not.
BUT - since I'm building Functor and Monad, I should consider it.
AFTER - writing Functor, then read up on applicative.
Applicative = Functor + Appliable
* Note - I think I once figured out that 'Applicative' is basically a functor category.
* Description of Applicative from Wiki: https://en.wikipedia.org/wiki/Applicative_functor
** "Due to historical accident, applicative functors were not implemented as a subclass of Functor and not as a superclass of Monad, but as a separate type class with no overlap. It turned out that in practice, there was very little demand for such a separation, so in 2014, it was proposed to make Applicative retroactively a subclass of Functor.[2]"
** This description describes 
(return, fmap, join) 
* May or may not need the distinction: fmap vs amap vs mmap/bind
** Functor fmap :: (a -> b) -> f a -> f b
** Applicative amap/(<*>) :: f (a -> b) -> f a -> f b  
** Monad mmap/bind/(>>=) :: m a -> (a -> m b) -> m b
** My own formulation of this is:
*** fmap --> map(f::(a->b), F<a>)->F<b> ... in a functor which is not necessarily a category
*** amap/<*> --> apply(F<f::(a->b)>, F<a>)->F<b> ... in a functor category
*** bind/>>= --> bind(f::(a->F<B>), F<A>)->F<B>) ... in a monad category

Monad
------------------------------------------
after finishing functor - becuase it's a refined version of Mappable
* Monad = Liftable + Mappable  + laws
* Write/transcribe monad laws
** Needs to make clear the distinction of merge VS join. Which one requires nesting, and which one allows uneven nesting (ie [[arr1], [arr2]] vs [[arr1], v2, v3, [arr2]])
* (return, fmap, join)   VS  (return, fmap, bind)
** Two possible constructions for Monad
** join :: Monad m => m (m x) -> m x
*** join = (m) => bind(identity, m)
** bind :: Monad m => m a -> (a -> m b) -> m b
*** bind(f, ma) = (f, ma) => join(map(f, ma))
*** don't have join() unless monad is Joinable or (Monoid + Foldable) --> Joinable
* NOTE: join is often named 'foldMap'/'flatMap'. And 'foldMap' is also the 'fold'/'map' operation on a Foldable Monad (which I think might be Traversable, or a category between Monad and Traversable)
** ACTUALLY: Traversable implies 'Flattenable', not Joinable. The difference is whether or not the process sometimes be applied or not, based on type (the flattening/joining process - this is equivalent to detecting stems VS leafs in a tree, based on type).
* Standard utility functions:
** Some standard Haskell monad utility functions (https://hackage.haskell.org/package/base-4.9.0.0/docs/Control-Monad.html):
** sequence
** filter
** zip/zipWith
** MAYBE: when/guard/unless as well - if I can grok them properly


Mid-term Target Goals
=============================================


Traversable
--------------------------------
This is the next step after Monad.
I'll need to make a decision about whether this will be built on top of Monad or not.
Haskell does no-ish (it uses applicative). But 'yes' is simpler from my POV (which isn't using )
Traversable = Monad + Foldable
This is basically the interaction between monoid and foldable --> translate/build-up a structure.
Haskell's Typeclass Hierarchy seems to take a different approach to this: https://wiki.haskell.org/Typeclassopedia . In it:
	Applicative = Functor + Apply
	Traversable = Functor + Foldable + ~Applicative
	Monad = Applicative + ~Monoid (monoid in the function, not the value)
	Alternative = Applicative + Monoid


Note #1 - I vaguely recall reading something like "Traversable" is very similar/related to Monad logically, but for complicated historic/implementation reasons, is not actually related at the Typeclass level.
Note #2 - Also, recall that Haskell Monads are not the same as Category Theory Monads.

* NEEDS common constructor for this: Mappable = Liftable + Monoid + Foldable
** ATM - I don't recall if Traversable is necessarily a Monoid or not
** add function shove:
	function shove<T>(
		monad: Appendable<T> & {lift: <U>(value: U) => Appendable<U>},
		element: T): Appendable<T>{
		/* Add a single element into an appendable container.
	This is similar to an immutable version of Javascript's Array.push() method. */
	return appendable.lift<T>(element);
}
** add function merge:
	function merge<T, U extends Appendable<T> & {zero: () => U}>(
	// function merge<T, U extends {append: (other: U) => U, zero: () => U}>(
		base: U, ...appendables: Array<U>): U {
		return appendables.reduce(
			(accumulator: U, element: U) => append(accumulator, element),
			append(base.zero(), base)



Complete dependencies for Manifold
-----------------------------------
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
	~ maybe Space
	~ maybe Category
	~ maybe Monad


Functors for core categories
------------------------------
* Prerequisite 1: enough categories that are meaningfully convertible to each other.
** So finish: Foldable, Joinable, Monoid, Sequence, Vector, maybe Monad
** REALIZATION: functors require 'Mappable', which is close to the definition of Monad. So I should write the Monad category first
* Prerequisite 2: Add function interfaces (Morphisms) operating on a category
** ex. type Foldable.Morphism = <T>(pre: Foldable<T>) => Foldable<T>
** Note: this discusses translating the instances of the container, and not the non-instantiated static constainer itself
* Technically Functors can convert elements and morphisms. So I'll need to write some function converters operating on the function-interfaces defined in prerequisite 2
** ex. IterableMorphismToFoldable = (pre: Iterable.Morphism) => Foldable.Morphism
* Ideally, this can be used to have some way to articulate this for non-instantiated static classes. Ex.  IterableClassToFoldableClass = (pre: {lift: <T>(elm: T) => Iterable<T>}) => {lift: <T>(elm: T) => Foldable<T>}


Type-Logic
----------------
Provide constructors for type-unions and intersections, which returns a TypeCheckable monad. This needs the functions: is, fold, map, traverse


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
