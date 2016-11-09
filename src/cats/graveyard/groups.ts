/**
 * Group-Theory abstract classes and mixins
 */


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
	// Phantom export interface. Meant to distinguish 'zero' or empty elements to the type-checker.
	// Not meant to be extended or implemented
	//
	// ... is there a way to communciate to TypeScript that 'Zeroable'.append(X) != Zero?
	// ... It looks like it's prohibitive
}

export function zero<T>(zeroable: Zeroable<any>): Zeroable<T> {
	return zeroable.zero<T>();
}

export function isZero<T, U extends Zeroable<T>>(zeroable: any): zeroable is Zero<T, U> {
	if (zeroable.isZero !== undefined) {
		if (zeroable.isZero.call !== undefined) {
			if (zeroable.isZero()) {
				return true
			}
		}
	}
	return false
}


export interface Reducable<T> extends Zeroable<T>, Foldable<T> {
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

export function reduce<T, U extends Reducable<T>>(reducable: U, f: (first: U, second: T) => U): U {
	return reducable.fold<U>(f, reducable.zero<T>() as U)
}

export interface Appendable<T> {
	append(other: Appendable<T>): Appendable<T>;
}

export function append<T>(left: Appendable<T>, right: Appendable<T>): Appendable<T> {
	return left.append(right);
}

export interface Monoid<T> extends Zeroable<T>, Appendable<T> {
	/*
	Monoids are talked about a lot in the literature, so I'm including
	them here as a reference point.
	 */
	zero<U>(): Monoid<U>;
	isZero(): this is Zero<T, Monoid<T>>;
	append(other: Monoid<T>): Monoid<T>;
}

export interface Joinable<T> extends Zeroable<T>, Appendable<T>, Foldable<T> {
	/**
	 * Note - any Joinable structure will necessarily be a Monoid as well.
	 */
	zero<U>(): Joinable<U>;
	isZero(): this is Zero<T, Joinable<T>>;
	fold<U>(f: (first: U, second: T) => U, initial: U): U;
	append(other: Joinable<T>): Joinable<T>; 
	join(): Joinable<T>;
}

export abstract class JoinableMixin<T> implements Joinable<T> {
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

export function join<T, U extends Joinable<T>>(joinable: Joinable<T>): U{
	return joinable.fold(joinable.append.call, joinable.zero())
}

export interface Mappable<T> {
	map<U>(f: (value: T) => U): Mappable<U>;
}

export function map<T, U>(mappable: Mappable<T>, f: (value: T) => U): Mappable<U> {
	// This should actually return the same type as 'mappable', although with a different
	// generic parameter - but there is no way to describe that in Typescript.
	return mappable.map<U>(f)
}

export interface Bindable<T> {
	bind<U>(f: (value: T) => Bindable<U>): Bindable<U>;
}

export function bind<T, U>(bindable: Bindable<T>, f: (value: T) => Bindable<U>): Bindable<U> {
	// this should actually return the same type as 'bindable', although with a different
	// generic parameter (U) - but there is no way to describe tha tin Typescript
	return bindable.bind<U>(f)
}

export interface Liftable<T> {
	lift<U>(value: U): Liftable<U>;
}

export function lift<T, U extends Liftable<T>>(liftable: U, value: T): U {
	return liftable.lift(value) as U;
}





export interface Functor<T> extends Mappable<T> {
	map<U>(f: (value: T) => U): Functor<U>;
	lift(value: T): Functor<T>;
}

export abstract class FunctorMixin<T> implements Liftable<T>, Zeroable<T>, Foldable<T> {
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

export interface Monad<T> extends Functor<T>, Bindable<T> {
	map<U>(f: (value: T) => U): Monad<U>;
	lift(value: T): Monad<T>;
	bind<U>(f: (value: T) => Monad<U>);
}

export abstract class MonadMixin<T> extends FunctorMixin<T> {
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

export interface Traversable<A> {
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

export function traverse<A, B>(traversable: Traversable<A>, f: (value: A) => Functor<B>): Functor<Traversable<B>> {
	return traversable.traverse<B>(f)
}
//
//
//

// export function traverseTree(f, locus) {
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
// }





export interface Constructible<T> {
	/*  Constructible & Buildable are utility types, used to appease TypeScript
	when calling this.constructor from methods. */
	new (...args: any[]): T;
};

export interface Buildable<T> extends Constructible<T>, Function {
}



interface Reducable<T> {

}





export {
	Foldable,

}