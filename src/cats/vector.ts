/**
 *
 * this is serving as goal-target for what I need to be able to articulate with
 * categories, in order to make 'Grid' sensible.
 *
 * Manifold / Grid - should be a subtype/instance of Vector
 * 
 */

/*
Chain of not-yet-completed dependencies:

Manifold
	ImmutableVector
		Vector
			Sequence
				Record

		ImmutableSequence
			ImmutableRecord
				Liftable
	Joinable
		Reducable
			Foldable
			Zeroable
		Appendable

	Traversable
		Bindable
			Mappable

	~ maybe Monoid
	~ maybe Monad
	~ maybe Space
	~ maybe Category
 */

class Vector<C, T> extends Sequence<C, T> {

}


class ImmutableVector<C, T> extends ImmutableSequence<C, T> {
	/*
	foldable,
	zeroable,
		reducable,
	mappable,
	liftable,

	mappable,
	traversable

	~ foldable, monoid, monad, traversable
	 */
}



/*
This is splat of code I wrote earlier, and it will likely need to be heavily rewritten
=======================================================================
*/


abstract class Vector<C extends Array<number>, T> {
	/* Collections object with numeric (integer) indexes, ordered data,
	and defined finite length.



	MAYBE: if we make enumerate() one of the basis functions, then we don't need sizes(),
		and will get a more generic data-structure.

	Laws:
	---------
	Important principles not expressible in this type-system.
	(1) getitem can retreive any element T in V
	(2) enumerate() returns all T and C in V
	(3) for any pair [C, T] returned by enumerate(), getitem(C) == T
	(4) all T are equitable, so forall T1, T2 in T, equal(T1, T2): boolean
	*/
	// abstract sizes(): Array<number>;
	abstract getitem(i: C): T;
	abstract indices(): Array<C>;
	// Mixin methods
	values(): Array<T> {
		return this.indices().map((index: C) => this.getitem(index))
	}
	enumerate(): Array<[C, T]> {
		return this.indices().map((index: C) => [index, this.getitem(index)] as [C, T])
	}
	fold<U>(f: (acc: U, x: T, i: C) => U, x0: U): U {
		return this.enumerate().reduce<U>(
			(acc: U, [elm, ind]) => f(acc, elm, ind)
		, x0);
	}
	equal(other: Vector<C, T>): boolean;
	find(x: T): Array<C>;
	count(x: T): number;
	contains(x: T): boolean;
}

abstract class ImmutableVector<C, T> extends Vector<C, T> {
	abstract setitem(x: T, i: C): ImmutableVector<C, T>;
	abstract zero<U>(): ImmutableVector<C, U>;
	abstract lift<U>(value: U): ImmutableVector<C, U>;
	abstract push(value: T): ImmutableVector<C, T>;
	// Mixin methods
	insert(x: T, i: C): ImmutableVector<C, T>;
	append(other: ImmutableVector<C, T>): ImmutableVector<C, T>;
	map<U>(f: (x: T, i: C) => U): ImmutableVector<C, U>;
	bind<U>(f: (x: T, i: C) => ImmutableVector<C, U>): ImmutableVector<C, U>;
	traverse<U>(f: (x: T, i:C) => ImmutableVector<C, T>): ImmutableVector<C, U
}




interface IImmutableVector_Static<T> {
	new(values: Array<T>): IImmutableVector_Instance<T>;
	zero<U>(): IImmutableVector_Instance<U>;
	lift<U>(value: U): IImmutableVector_Instance<U>;
}
interface IImmutableVector_Instance<T> {
	zero<U>(): IImmutableVector_Instance<U>;
	lift<U>(value: U): IImmutableVector_Instance<U>;
	push(value: T): IImmutableVector_Instance<T>;
	append(other: IImmutableVector_Instance<T>): IImmutableVector_Instance<T>;

	map<U>(f: (x: T, i: C) => U): ImmutableVector<C, U>;
	bind<U>(f: (x: T, i: C) => ImmutableVector<U>): ImmutableVector<C, U>;
}




 */