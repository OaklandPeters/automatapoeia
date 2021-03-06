/*
Idealized simplification.

What is my goal here... to reduce Manifold down it's basis functions
+ the bare minimum

(1) Write my own version of Sequence + MutableSequence: Vector + MutableVector
 */
import {RecursiveArray, isRecursiveArray} from '../support';


type Path = Array<number>;
type Rec<T> = T | RecursiveArray<T>;
type FoldFunc<T, U> = ( accumulator: U,
						element: T | RecursiveArray<T>,
						path: Array<number>,
						thisManifold?: IManifold<T>
						) => U;
type MapFunc<T, U> = (value: T | RecursiveArray<T>,
					  path: Path,
					  thisManifold?: IManifold<T>
					  ) => U;


interface IManifold<T> {

	fold<U>(f: FoldFunc<T, U>, initial: U, initial_path: Path)
	zero
	reduce
	append
	join
	flatten

	map<U>)(f: MapFunc<T, U>, inital_path: Path)
	bind
	traverse
}


// for comparison, this is a Pythonic MutableSequence
abstract class Sequence<C, T> {
	/*
	Note - generalizing this to higher-dimension is... complex.
		len --> sizes & dimension
		Basically, conversion of things expecting index into path
	@todo: translate these into more Javascript-y category functions.
		map, etc

	Updated Methods
	-------------------
	len(): number --> sizes(): Array<number>
	iter(): enumerate(): Array<C, T>
	... with these two, I can derive iter()
	index(x: T, begin=0, end=this.len()): C --> find(x: T): Array<C>

	New/Enhanced Methods
	-----------------------
	equal(other:)
	copy()
	fold/map/traverse
	literal()

	 */
	abstract iter(): Array<T>;
	abstract getitem(i: C): T;
	abstract len(): number;
	// Mixin methods
	index(x: T, begin=0, end=this.len()): C;
	count(x: T): number;
	contains(x: T): boolean;

	// Not sure if I need these
	reversed(): MutableSequence<C, T>;
}


abstract class MutableSequence<C, T> extends Sequence<C, T> {
	/*
	Decision?  Immutable or mutable. Affects return type of setitem, delitem, insert.
	--> Sequence, MutableSequence, ImmutableSequence

	Updated Methods
	--------------------
	append(x: T): void   			-->   push(x: T): void;
	extend(mx: Iterable<T>): void   -->   append(mx: Iterable<T>): void;
	pop(i: C=-1): T  --> pop(i: C = last(this))
		something with a meaningful sense of first/rest/front/last


	*/
	abstract setitem(i: C, x: T): void;
	abstract delitem(i: C): void;
	abstract insert(i: C, x: T): void;
	// Mixin methods
	append(x: T): void;
	extend(mx: Iterable<T>): void;
	// Not sure if I need these
	reverse(): void;	// reverses in place
	pop(i: C=-1): T
	remove(x: T): void;
}


interface IIterable<T> {
	enumerate(): Array<T>;
}




interface VectorMin<C, T> {
	/* Collections object with numeric indexes, ordered data, and defined finite length.
	*/
	sizes(): Array<number>;
	getitem(i: C): T;
}


function indices
function _indices(vector: Vector<any, any>, accumulator: Array<Array<number>>, sizes: Array<number>, path: Array<number>): Array<Array<number>> {

}

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
