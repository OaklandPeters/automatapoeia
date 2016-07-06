/**
 *	Category-theoretic alternative to Array
 *
 * Note to self: I need a lazy version of map/bind. for typescript/Javascript. So, instead of:
 * 	map::(F<T>, (T -> U)) -> F<U>
 * 	bind::(F<T>, (T -> F<U>)) -> F<U>
 * 		OR
 * 	map<U>(f: (value: T) => U): Mappable<U>;
 * 	bind<U>(f: (value: T) => Bindable<U>): Bindable<U>;
 * 	
 * We have:
 * 	mapF::(T -> U) -> (F<T> -> F<U>)
 * 	bindF::(T -> F<U>) -> (F<T> -> F<U>)
 * 		OR
 * 	static mapF<T, U>(f: (value: T) => U): (values: Mappable<T>) => Mappable<U>;
 * 	static bindF<T, U>(f: (value: T) => Bindable<U>): (values: Bindable<T>) => Bindable<U>;
 *
 *
 * TODO:
 * [] Compile and test this
 * [] Join is incorrect, because it doesn't switch on whether or not the element is a list.
 */
import {Buildable} from './support';


interface RecursiveObject<T> { }
interface RecursiveContainer<T> extends RecursiveObject<T | RecursiveContainer<T>>{ }

interface IList<T> {
	zero<U>(): IList<U>;
	lift<U>(value: U): IList<U>;
	fold<U>(merger: (first: U, second: T) => U, initial: U): U;
	append(other: IList<T>): IList<T>;
	map<U>(f: (value: T) => U): IList<U>;
	bind<U>(f: (value: T) => IList<U>): IList<U>;
	traverse<U>(f: (value: T) => IList<U>): IList<U>;
}

function isList<T>(value: any): value is List<T> {
	return List.is(value)
}

class List<T> implements IList<T> {
	/*
	Todo:
	[] Organize this, with the basis functions first
	[] Todo: replace argument type in append(other: {}) to an interface
	 */
	constructor(
		public data: Array<T>
	) {}
	// Basis functions
	// 
	// zero/lift/isZero/is static functions are also expressed as instance methods
	static zero<U>(): List<U> {
		return new List<U>([]);
	}
	static lift<U>(value: U): List<U> {
		return new List<U>([value]);
	}
	static isZero<T, U extends Zeroable<T>>(list: any): list is (Zero<T, U> & List<T>) {
		return (list.data.length !== 0)
	}
	static is<T>(value: any): value is List<T> {
		return (value instanceof List);
	}
	fold<U>(merger: (first: U, second: T) => U, initial: U): U {
		/* Processes the data structure, incrementally merging in one value into an accumulator
		which begins with the value 'initial', and with the merge being carried out by some
		function 'merger'.
		 */
		let accumulator = new Array<U>();
		return this.data.reduce<U>((prev, next) => merger(prev, next), initial);
	}
	append(other: List<T>): List<T> {
		/* Identical to Array.concat, but plays well with TypeScript when T != U. */
		return new List<T>(new Array<T>().concat(this.data).concat(other.data));
	}
	map<U>(f: (value: T) => U): List<U> {
		/*
		Apply a function to each of this list.
		Derives 'map' from 'fold' and 'append'
		 */
		let adaptor = (accumulator: List<U>, value: T) => accumulator.append(this.lift<U>(f(value)))
		return this.fold<List<U>>(adaptor, this.zero<U>());
	}
	bind<U>(f: (value: T) => List<U>): List<U> {
		return (this.map<U | List<U>>(f)).join() as List<U>;
	}

	// export function traverseArray<T, U>(f: (x: T)=>RecursiveArray<U>, locus: RecursiveArray<T>): RecursiveArray<U> {
	// 	return locus.reduce(function(accumulator, element){
	// 		if (isArray(element)) {
	// 			return accumulator.concat([traverseArray(f, element)])
	// 		} else {
	// 			return accumulator.concat(f(element))
	// 		}
	// 	}, [] as RecursiveArray<U>)
	// }

	traverse<U>(f: (value: T) => List<U>): List<U | List<U>> {
		/**
		 * Map each element, and collect the results.
		 * Like bind, it can return a variable number of results inside the monad.
		 * Unlike bind, it does not flatten out the shape.
		 *
		 * We need this to be true, but have no way to say it:
		 * 		T == S | List<S>
		 *
		 * todo: convert the below example:
		 * var nested = new List([[1, 2], [3, 4], [5], 6, [[7, 8]]])
		 * nested.traverse((x) => [x-2, x+2])
		 * List([[-1, 3, 0, 4], [1, 5, 2, 6], [3, 7], 4, 8, [[5, 9, 6, 10]]])
		 */
		// type iU = U | List<U>;
		// return this.fold<List<iU>>(
		// 	function(accumulator: List<iU>, element: T | List<T>): List<iU> {
		// 		if (List.is<T>(element)) {
		// 			return accumulator.append(
		// 				List.lift<iU>(element.traverse<U>(f) as List<U>)
		// 			)
		// 		} else {
		// 			return accumulator.append(f(element))
		// 		}
		// 	},
		// 	this.zero<iU>()
		// )

		type iU = U | List<U>;
		return this.reduce<iU>(
			function(accumulator: List<iU>, element: T | List<T>): List<iU> {
				if (List.is<T>(element)) {
					return accumulator.append(
						List.lift<iU>(element.traverse<U>(f) as List<U>)
					)
				} else {
					return accumulator.append(f(element))
				}
			}
		)
	}

	//
	//	Derivable functions
	//
	reduce<U>(merger: (first: List<U>, second: T) => List<U>): List<U> {
		/* Fold, but makes use of List.zero() as the intial value. */
		return this.fold<List<U>>(merger, this.zero<U>())
	}

	join(): List<T> {
		/* Reduce, but makes use of 'List.append()' as the merging function.

		Note, there are two ways to write this. The way that makes the group-theory
		structure clear  (the way that Appendable/Monoidal --implies--> Joinable) is:
			let appender = (first: List<T>, second: T) => first.append(new List<T>([second]))
		A more computationally efficient way avoids reallocating new List objects:
			let appender = (first: List<T>, second: T) => first.push(second);
		*/
		return this.reduce((accumulator: List<T>, next: T | List<T>) =>
			accumulator.append(
				List.is<T>(next) ? next : List.lift(next)
			)
		)
	}

	//
	// Convience functions, and more efficient low-level implementation versions
	// 
	joinEfficient(): List<T> {
		return this.reduce((first: List<T>, second: T) => first.push(second));
	}
	shove(value: T): List<T> {
		/* Immutable version of push/shove. */
		return new List<T>(new Array<T>().concat(this.data).concat([value]))
	}
	push(value: T): this {
		/* Mutable version of push/shove. Included because it is more efficent than
		the immutable version (it avoids two new object instantiations), and because
		this makes it more similar to the prototype of Array. */
		this.data.push(value);
		return this;
	}
	mapEfficient<U>(f: (value: T) => U): List<U> {
		/* Efficient version, using lower-level access on the wrapped array. */
		let accumulator = new Array<U>();
		this.data.forEach((elm, i, thisArray) => accumulator.push(f(elm)));
		return new List(accumulator);
	}
	static mapFunction<T, U>(f: (value: T) => U): (list: List<T>) => List<U> {
		/*  Wraps a function to operate on Lists.
			This is the version of 'Map' as used in the context of Functors.
		*/
		function mapped(list: List<T>): List<U> {
			return list.map(f)
		}
		return mapped
	}
	static bindFunction<T, U>(f: (value: T) => List<U>): (list: List<T>) => List<U> {
		function bound(list: List<T>): List<U> {
			return list.bind(f)
		}
		return bound
	}

	//
	// Typescript-specific utility functions
	//
	// zero/lift/is/isZero are expressed as static and instance methods 
	zero<U>(): List<U> {
		return List.zero<U>();
	}
	lift<U>(value: U): List<U> {
		return List.lift<U>(value);
	}
	is<T>(): this is List<T> {
		return List.is<T>(this);
	}
	isZero(): this is (Zero<T, this> & List<T>) {
		return List.isZero<T, this>(this);
	}
}





/**
 * Group-Theory abstract classes and mixins
 */
interface Foldable<T> {
	fold<U>(f: (first: U, second: T) => U, initial: U): U;
}

function fold<T, U>(foldable: Foldable<T>, f: (first: U, second: T) => U, initial: U): U {
	return foldable.fold(f, initial)
}

interface Zeroable<T> {
	/*
	Zero is the 'empty' or 'null' element for a group. It is given meaning in Monoids,
	where the law holds:
		Monoid.zero() + X == X   for all X in the Monoid
	
	We would like 'zero' to be accessible as both a staticmethod and an instancemethod.
	We have 'zero<U>' take the type-parameter U, so that it can be used to construct
	generic instances with different parameters

	In the mathematical sense, 'isZero' is not a necessary method - but in the real world
	having a 'zero' element is useless if we can not tell whether or not some given
	element is equal to it. This lets us use zero for our base case in many
	recursion schemes.
	*/
	zero<U>(): Zeroable<U>;
	isZero(): this is Zero<T, this>;
}

interface Zero<T, U extends Zeroable<T>> extends Zeroable<T> {
	// Phantom interface. Meant to distinguish 'zero' or empty elements to the type-checker.
	// Not meant to be extended or implemented
	//
	// ... is there a way to communciate to TypeScript that 'Zeroable'.append(X) != Zero?
	// ... It looks like it's prohibitive
}

function zero<T>(zeroable: Zeroable<any>): Zeroable<T> {
	return zeroable.zero<T>();
}

function isZero<T, U extends Zeroable<T>>(zeroable: any): zeroable is Zero<T, U> {
	if (zeroable.isZero !== undefined) {
		if (zeroable.isZero.call !== undefined) {
			if (zeroable.isZero()) {
				return true
			}
		}
	}
	return false
}


interface Reducable<T> extends Zeroable<T>, Foldable<T> {
	// reduce is definable from zero and foldr
	zero<U>(): Reducable<U>;
	isZero(): this is Zero<T, Reducable<T>>;
	fold<U>(f: (first: U, second: T) => U, initial: U): U;
	reduce(f: (first: Reducable<T>, second: T) => Reducable<T>): Reducable<T>;
}

abstract class ReducableMixin<T> implements Reducable<T> {
	abstract zero<U>(): Reducable<U>;
	abstract fold<U>(f: (first: U, second: T) => U, initial: U): U;
	abstract isZero(): this is Zero<T, ReducableMixin<T>>;
	reduce(f: (first: Reducable<T>, second: T) => Reducable<T>): Reducable<T> {
		return this.fold<Reducable<T>>(f, this.zero())
	}
}

function reduce<T, U extends Reducable<T>>(reducable: U, f: (first: U, second: T) => U): U {
	return reducable.fold<U>(f, reducable.zero<T>() as U)
}

interface Appendable<T> {
	append(other: Appendable<T>): Appendable<T>;
}

function append<T>(left: Appendable<T>, right: Appendable<T>): Appendable<T> {
	return left.append(right);
}

interface Monoid<T> extends Zeroable<T>, Appendable<T> {
	/*
	Monoids are talked about a lot in the literature, so I'm including
	them here as a reference point.
	 */
	zero<U>(): Monoid<U>;
	isZero(): this is Zero<T, Monoid<T>>;
	append(other: Monoid<T>): Monoid<T>;
}

interface Joinable<T> extends Zeroable<T>, Appendable<T>, Foldable<T> {
	/**
	 * Note - any Joinable structure will necessarily be a Monoid as well.
	 */
	zero<U>(): Joinable<U>;
	isZero(): this is Zero<T, Joinable<T>>;
	fold<U>(f: (first: U, second: T) => U, initial: U): U;
	append(other: Joinable<T>): Joinable<T>; 
	join(): Joinable<T>;
}

abstract class JoinableMixin<T> implements Joinable<T> {
	/*
	A method of implementing Joinable for classes that already implement
	Zeroable, Foldable, and Appendable.

	 */
	abstract zero<U>(): JoinableMixin<U>;
	abstract fold<U>(f: (first: U, second: T) => U, initial: U): U;
	abstract append(other: JoinableMixin<T>): JoinableMixin<T>;
	abstract isZero(): this is Zero<T>;
	reduce(f: (first: JoinableMixin<T>, second: T) => JoinableMixin<T>): JoinableMixin<T> {
		return this.fold<JoinableMixin<T>>(f, this.zero())
	}
	join(): Joinable<T> {
		return this.fold(this.append.call, this.zero())
	}
}

function join<T, U extends Joinable<T>>(joinable: Joinable<T>): U{
	return joinable.fold(joinable.append.call, joinable.zero())
}

interface Mappable<T> {
	map<U>(f: (value: T) => U): Mappable<U>;
}

function map<T, U>(mappable: Mappable<T>, f: (value: T) => U): Mappable<U> {
	// This should actually return the same type as 'mappable', although with a different
	// generic parameter - but there is no way to describe that in Typescript.
	return mappable.map<U>(f)
}

interface Bindable<T> {
	bind<U>(f: (value: T) => Bindable<U>): Bindable<U>;
}

function bind<T, U>(bindable: Bindable<T>, f: (value: T) => Bindable<U>): Bindable<U> {
	// this should actually return the same type as 'bindable', although with a different
	// generic parameter (U) - but there is no way to describe tha tin Typescript
	return bindable.bind<U>(f)
}

interface Liftable<T> {
	lift<U>(value: U): Liftable<U>;
}

function lift<T, U extends Liftable<T>>(liftable: U, value: T): U {
	return liftable.lift(value) as U;
}





interface Functor<T> extends Mappable<T> {
	map<U>(f: (value: T) => U): Functor<U>;
	lift(value: T): Functor<T>;
}

abstract class FunctorMixin<T> implements Liftable<T>, Zeroable<T>, Foldable<T> {
	/*
	If a class is both Liftable and Joinable (hence Foldable/Reduceable and a Monoid),
	then you can deduce an implementation for Functor
	*/
	abstract lift<U>(value: U): FunctorMixin<U>;
	abstract zero<U>(): FunctorMixin<U>;
	abstract fold<U>(f: (first: U, second: T) => U, initial: U): U;
	abstract append(other: FunctorMixin<T>): FunctorMixin<T>;
	abstract isZero(): this is Zero<T>;
	reduce(f: (first: FunctorMixin<T>, second: T) => FunctorMixin<T>): FunctorMixin<T> {
		return this.fold<FunctorMixin<T>>(f, this.zero())
	}
	join(): FunctorMixin<T> {
		return this.fold(this.append.call, this.zero())
	}
	map<U>(f: (value: T) => U): FunctorMixin<U> {
		let adaptor = (accumulator: FunctorMixin<U>, value: T) => accumulator.append(this.lift<U>(f(value)))
		return this.fold<FunctorMixin<U>>(adaptor, this.zero<U>());
	}	
}

interface Monad<T> extends Functor<T>, Bindable<T> {
	map<U>(f: (value: T) => U): Monad<U>;
	lift(value: T): Monad<T>;
	bind<U>(f: (value: T) => Monad<U>);
}

abstract class MonadMixin<T> extends FunctorMixin<T> {
	/*
	
	... ? Does this have any more requirements than FunctorMixin?	
	 */
	abstract lift<U>(value: U): MonadMixin<U>;
	abstract zero<U>(): MonadMixin<U>;
	abstract fold<U>(f: (first: U, second: T) => U, initial: U): U;
	abstract append(other: MonadMixin<T>): MonadMixin<T>;
	reduce(f: (first: MonadMixin<T>, second: T) => MonadMixin<T>): MonadMixin<T> {
		return this.fold<MonadMixin<T>>(f, this.zero())
	}
	join(): MonadMixin<T> {
		// Note: join() will strip out one level of nesting, if it is present
		// So, this<this<T>> --> this<T>
		return this.fold(this.append.call, this.zero())
	}
	map<U>(f: (value: T) => U): MonadMixin<U> {
		let adaptor = (accumulator: MonadMixin<U>, value: T) => accumulator.append(this.lift<U>(f(value)))
		return this.fold<MonadMixin<U>>(adaptor, this.zero<U>());
	}	
	bind<U>(f: (value: T) => MonadMixin<U>): MonadMixin<U> {
		/*
		'map', but accounts for f returning values in the same type as the Monad, and
		hence potentially multiple results nested inside two levels of the monad.
		This is removed by flattening with 'join' before returning
		 */
		type MaybeNestedMonad<U> = MonadMixin<U | MonadMixin<U>>;
		let accumulator: MaybeNestedMonad<U> = this.zero<U>();
		function adaptor(accumulator: MaybeNestedMonad<U>, value: T): MaybeNestedMonad<U> {
			let thing = f(value);
			let temp = this.lift(thing) as MonadMixin<MonadMixin<U>>;
			return accumulator.append(temp);
		}
		let mapped = this.fold<MaybeNestedMonad<U>>(adaptor, accumulator);
		// .join() will flatten out one level of nesting, if present
		return mapped.join() as MonadMixin<U>;
	}
}

interface Traversable<A> {
	// traverse:: Applicative f => (a -> f b) -> t a -> f(t b) Source #
	// for :: (Traversable t, Applicative f) => t a -> (a -> f b) -> f (t b)
	// mapAccumR:: Traversable t => (a -> b -> (a, c)) -> a -> t b -> (a, t c) Source #
	//    The mapAccumR function behaves like a combination of fmap and foldr; it applies
	//    a function to each element of a structure, passing an accumulating parameter
	//    from right to left, and returning a final value of this accumulator together
	//    with the new structure.
	// Example Haskell implementation:
	// 	traverse _ [] = pure []
	// 	traverse f (x:xs) = (:) <$>f x <*> traverse f xs

	// Note: The generic container of FB and the return type are meant to be
	// the same, but this can't be articulated in Typescript's Typesystem
	// The true signature would be:
	// traverse<B, F extends Functor>(f: (value: A) => F<B>): F<this<B>>;
	traverse<B>(f: (value: A) => Functor<B>): Functor<Traversable<B>>;

}

function traverse<A, B>(traversable: Traversable<A>, f: (value: A) => Functor<B>): Functor<Traversable<B>> {
	return traversable.traverse<B>(f)
}
//
//
//

function traverseTree(f, locus) {
	/*
	if locus is Empty
		return Tree.Empty
	if locus is Leaf
		return Tree.map(Leaf, f(locus.value))
	if locus is Node
		return Tree.zero()
			.append(Tree.map(Node, Tree.traverse(f, locus.left))
			.append(Tree.map(Node, f(locus.value)))
			.append(Tree.map(Node,Tree.traverse(f, locus.right)))
	 */
}
