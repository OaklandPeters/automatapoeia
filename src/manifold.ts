/**
 *
 *	@todo: Move Coordinate stuff to its own file
 * 
 *
 * Usage would look like:
 * type Kind = {};
 * class Grid extends Manifold<Coordinate, Kind> {}
 */
import {Buildable, assertType} from './support';
import {RecursiveArray, isRecursiveArray, traverseArray, isArray, flattenArray} from './support';

export interface ICoordinate extends Array<number> {
	dimension: number;
}

export interface IManifold<C extends ICoordinate, T> {
	// data: RecursiveArray<T>;

	dimension: number;

	/* Accessors */
	get(coordinate: C): T | ISubManifold<C, T>;
	set(coordinate: C, cell: T | RecursiveArray<T>): void;
	delete(coordinate: C): void;



	/* Group-theoretic
	-------	
	This should fold along the top-level, and allow for recursion into the lower levels
	So... fold might actually have the signature:
			fold<U>(f: (first: U, second: IManifold<T> | T) => U, initial: U): U
	*/
	// fold<U>(f: (first: U, second: T | ISubManifold<C, T>) => U, initial: U): U;
	// zero<_C extends ICoordinate, _T>(): IManifold<_C, _T>;
	// reduce<U>(f: (accumulator: IManifold<C, U>, element: T | ISubManifold<C, T>) => IManifold<C, U>): IManifold<C, U>;
	// append(other: IManifold<C, T>): IManifold<C, T>;
	// join(): IManifold<C, T>;

	/* Functional
	------------------
	traverse/bind MIGHT return ISubManifold<> instead, I'm not sure
	*/
	// map<U>(f: (value: T, path: C, thisManifold: IManifold<C, T>) => U): IManifold<C, U>;	
	// bind<U>(f: (value: T, path: C, thisManifold: IManifold<C, T>) => IManifold<C, U>): IManifold<C, U>;
	// traverse<U>(f: (value: T, path: C, thisManifold: this) => IManifold<C, U>): IManifold<C, U>;
	
	// Extended Utility
	// enumerate(): Array<[C, T]>;
}

function isIManifold<C extends ICoordinate, T>(value: any): value is IManifold<C, T>  {
	/*
	... I really don't know what I should be checking here
	This would be a LOT cleaner with the utilties from type_check.ts:
		return StructuralCheck(value,
			{get: Function, set: Function, delete: Function,
			map: Function, bind: Function, traverse: Function})
	*/
	return (value.get !== undefined
			&& value.set !== undefined
			&& value.delete !== undefined)
}

interface ISubManifold<C extends ICoordinate, T> extends IManifold<C, T> {
	/**
	 * A manifold embedded inside another manifold.
	 * Accessors here should proxy through to the parent.
	 *
	 * coordinate: coordiante to the start of this submanifold in the parent manifold
	 * 		(probably the lower-indexed corner)
	 *
	 * This should override these properties to proxy to the parent:
	 * 	get
	 * 	set
	 * 	delete
	 */
	parent: IManifold<C, T>;
	coordinate_in_parent: C;
	convert_coordinate(coordinate: C): IManifold<C, T>;
	// static is<C, T>(value: any): value is ISubManifold<C, T>;
}


export class Coordinate extends Array<number> implements ICoordinate {
	/*
	An array of numbers indexing into a specific manifold.
	LeafCoordinate and StemCoordinate are used to aid type-checking, by
	deterening what manifold.get(coorindate) might return
	 */
	manifold: IManifold<ICoordinate, any>;
	constructor(
		manifold: IManifold<ICoordinate, any>,
		values: Array<number>
	) {
		super(...values);
		this.manifold = manifold;
	}

	get dimension() {
		return this.length;
	}

	static is(value: any): value is Coordinate {
		if ((value.length !== undefined)
			&& (typeof value.every === 'function')) {
			return value.every((x: any) => (typeof x === 'number'))
		}
		return false
	}

	append(items: Array<number>): this {
		/* Array.concat, but that function has problems with the return type
		being always 'Array'.
		*/
		return super.concat(items) as any as this
	}
}

export class LeafCoordinate extends Coordinate {
	constructor(
		manifold: IManifold<ICoordinate, any>,
		values: Array<number>
	) {
		LeafCoordinate.assert({dimension: values.length, manifold: manifold})
		super(manifold, values);
	}

	static is(coordinate: any): coordinate is LeafCoordinate {
		if (Coordinate.is(coordinate)) {
			return (coordinate.manifold.dimension === coordinate.dimension)
		}
		return false
	}
	static assert(value: {dimension: number, manifold: IManifold<ICoordinate, any>}): LeafCoordinate {
		if (LeafCoordinate.is(value)) {
			return value
		} else {
			throw `To access a leaf node, a coordinate of length ${value.dimension} must exactly match the manifold dimension of ${value.manifold.dimension}`;
		}		
	}

}

export class StemCoordinate extends Coordinate {
	constructor(
		manifold: IManifold<ICoordinate, any>,
		values: Array<number>
	) {
		StemCoordinate.assert({dimension: values.length, manifold: manifold});
		super(manifold, values);
	}
	static is(value: any): value is StemCoordinate {
		if (Coordinate.is(value)) {
			return (value.manifold.dimension > value.dimension);
		}
		return false
	}
	static assert(value: {dimension: number, manifold: IManifold<ICoordinate, any>}): StemCoordinate {
		if (StemCoordinate.is(value)) {
			return value
		} else {
			throw `To access a stem node, a coordinate of length ${value.dimension} must be less than the manifold dimension of ${value.manifold.dimension}`;
		}		
	}
}


export abstract class ManifoldBase<T> implements IManifold<Coordinate, T> {
	/*
	Generic arbitary-dimensional array-like object.

	An abstraction of the grid class, that doesn't know the type of the Cell
	it contains.
	Why?  So that 'map' can return a Grid containing a different type of cell.

	@todo: data should probably be protected, but this i=pisses off the IManifold,
		because I don't know how to specify 'protected' in an interface
	@todo: Adapt fold & reduce to accept functions with a 3rd parameter - 'path'.
		This requires an adaptation step before passing it into this.data.reduce()
		- because that array function expects a index: number, not path: number[]
	@todo: Testing to confirm that .join() actually can remove a lair of nesting.
		... I'm not sure whether nesting should be in regard to inner-manifolds,
		or inner arrays
	@todo: See if I can make _get, _set, _delete into protected methods
	@todo: Address problems with inheriting from this. Many things that return Manifold will need their signatures overwritten in SubManifold
	 */

	data: RecursiveArray<T>;

	makeSubManifold(coordinate: Coordinate): SubManifold<T> {
		// Temporary hack on this type conversion. @todo: remove it
		return new SubManifold<T>(this, coordinate)
	}

	get dimension(): number {
		/*
		This assumes that the data array is homogeneous.
		 */
		let dim = 0;
		let lense: RecursiveArray<any> = this.data;
		while (lense instanceof Array){
			dim += 1;
			lense = lense[0];
		}
		return dim;
	}

	coordinate(values: Array<number>): Coordinate {
		return new Coordinate(this, values)
	}

	// Protected/private accessors
	// Accessors for potentially deeply nested internal arrays
	// These would be protected, but SubManifolds into this Manifold
	// need access to it.
	_set(coordinate: Coordinate, value: T | RecursiveArray<T>): void {
		this._check_coordinate(coordinate)
		let front = coordinate.slice(0, -1) as Coordinate;
		let last = coordinate.slice(-1)[0];
		let deepestArray = this.get(front);	
		deepestArray[last] = value;
		return;
	}
	_get(coordinate: Coordinate): T | RecursiveArray<T> {
		this._check_coordinate(coordinate)
		let lense: T | RecursiveArray<T> = this.data;
		coordinate.forEach((coord) => (lense = lense[coord]));
		return lense;
	}
	_delete(coordinate: Coordinate): void {
		this._check_coordinate(coordinate)
		let front = coordinate.slice(0, -1) as Coordinate;
		let last = coordinate.slice(-1)[0];
		let deepestArray = this.get(front);
		delete deepestArray[last];
	}

	// Accessors with more definite return types (IE not union types).
	getLeaf(coordinate: Coordinate): T {
		this._check_leaf_coordinate(coordinate);
		return this._get(coordinate) as T
	}
	setLeaf(coordinate: Coordinate, value: T): void {
		this._check_leaf_coordinate(coordinate);
		return this._set(coordinate, value)
	}
	getStem(coordinate: Coordinate): SubManifold<T> {
		this._check_stem_coordinate(coordinate);
		return this.makeSubManifold(coordinate);
	}
	setStem(coordinate: Coordinate, value: Manifold<T>) {
		this._set(coordinate, value.toArray())
	}


	toArray(): RecursiveArray<T> {
		return this.data
	}

	protected _check_coordinate(coordinate: Coordinate): void {
		if (coordinate.dimension > this.dimension) {
			throw `coordinate of length ${coordinate.dimension} is too large to index into manifold of length ${this.dimension}`;
		}
	}
	protected _check_leaf_coordinate(coordinate: Coordinate): void {
		if (coordinate.dimension !== this.dimension) {
			throw `To access a leaf node, a coordinate of length ${coordinate.dimension} must exactly match the manifold dimension of ${this.dimension}`;
		}
	}
	protected _check_stem_coordinate(coordinate: Coordinate): void {
		if (!(coordinate.dimension < this.dimension)) {
			throw `To access a stem node, a coordinate of length ${coordinate.dimension} must be smaller than the manifold dimension of ${this.dimension}`;
		}
	}
	protected _check_point_invariant(coordinate: Coordinate, value: T | Manifold<T>): void {
		/* Confirms this is true: 
		coordinate.dimension + value.dimension  == this.dimension */
		let value_dimension = SubManifold.is<T>(value) ? value.dimension : 0;
		if ((value_dimension + coordinate.dimension) !== this.dimension) {
			throw (`Invariant violation: coordinate.dimension `
				+ `(${coordinate.dimension}) value.dimension (${value_dimension})`
				+ ` !== this.dimension (${this.dimension})`)
		}
	}


	// Public accessors
	// These may return SubManifolds
	get(coordinate: Coordinate): T | SubManifold<T> {
		let value = this._get(coordinate);
		if (isRecursiveArray(value)) {
			return this.makeSubManifold(coordinate);
		} else {
			return value
		}
	}
	set(coordinate: Coordinate, value: T | Manifold<T>): void {
		/*
		This gets somewhat complicated because of edge cases.
		It may potentially assign a submanifold to a point.
		In which case, the SubManifold needs to be sized correctly.
		... this is a pain in our ass
		 */		
		// invariant: coordinate.dimension + value.dimension  == this.dimension
		this._check_point_invariant(coordinate, value);
		if (Manifold.is<T>(value)) {
			this._set(coordinate, value.toArray())
		} else {
			this._set(coordinate, value)
		}
	}
	delete(coordinate: Coordinate): void {
		let front = coordinate.slice(0, -1) as Coordinate;
		let last = coordinate.slice(-1)[0];
		let deepestArray = this.get(front);
		delete deepestArray[last];
	}

	// Static/instance switching & type-theoretic
	lift<U>(data: RecursiveArray<U>): Manifold<U> {
		// Lift on a submanifold should return a new Manifold, not SubManifold
		return Manifold.lift<U>(data);
	}
	zero<U>(): Manifold<U> {
		return Manifold.zero<U>();
	}

	// Group-theoretic operations  (reference internal array)
	abstract fold<U>(f: (accumulator: U,
				 element: T | RecursiveArray<T>,
				 path: Array<number>,
				 thisManifold?: Manifold<T>
				 ) => U,
			 initial: U,
			 initial_path?: Array<number>
	): U;
	abstract _fold<U>(f: (accumulator: U,
				 element: T | RecursiveArray<T>,
				 path: Array<number>,
				 thisArray?: RecursiveArray<T>
				 ) => U,
			 initial: U,
			 initial_path?: Array<number>
	): U;

	// fold<U>(f: (accumulator: U,
	// 			 element: T | RecursiveArray<T>,
	// 			 path: Array<number>,
	// 			 thisManifold?: Manifold<T>
	// 			 ) => U,
	// 		 initial: U,
	// 		 initial_path: Array<number> = []
	// ): U {
	// 	// Adapt to Array.reduce(..., index: number) from path: Array<number>
	// 	return this.data.reduce<U>(
	// 		(acc: U, elm: T|RecursiveArray<T>, i: number, array: RecursiveArray<T | RecursiveArray<T>>) =>
	// 			f(acc, elm, initial_path.concat([i]), this),
	// 		initial)
	// }
	// _fold<U>(f: (accumulator: U,
	// 			 element: T | RecursiveArray<T>,
	// 			 path: Array<number>,
	// 			 thisArray?: RecursiveArray<T>
	// 			 ) => U,
	// 		 initial: U,
	// 		 initial_path: Array<number> = []
	// ): U {
	// 	// Adapt to Array.reduce(..., index: number) from path: Array<number>
	// 	return this.data.reduce<U>(
	// 		(acc: U, elm: T|RecursiveArray<T>, i: number, array: RecursiveArray<T | RecursiveArray<T>>) =>
	// 			f(acc, elm, initial_path.concat([i]), this.data),
	// 		initial)
	// }


	reduce<U>(f: (accumulator: Manifold<U>,
				 element: T | RecursiveArray<T>,
				 path: Array<number>,
				 thisManifold?: Manifold<T>
				 ) => Manifold<U>,
			 initial_path: Array<number> = []
	): Manifold<U> {
		// 'fold', but using Manifold.zero() as the base-case
		return this.fold<Manifold<U>>(f, this.zero<U>(), initial_path)
	}
	_reduce<U>(f:(accumulator: RecursiveArray<U>,
				  element: T | RecursiveArray<T>,
				  path: Array<number>,
				  thisArray?: RecursiveArray<T>
				  ) => RecursiveArray<U>,
			 initial_path: Array<number> = []
	): Manifold<U> {
		return this.lift<U>(
			this._fold<RecursiveArray<U>>(f, [] as RecursiveArray<U>, initial_path)
		)
	}

	append(other: Manifold<T>): Manifold<T> {
		return this._append(other.data)
	}
	_append(other: RecursiveArray<T>): Manifold<T> {
		/* Alternate version of append, used for efficiency, by avoiding
		allocating an extra Manifold, just to append it to an accumulator.*/
		return this.lift<T>(this.data.concat(other))
	}
	
	join(): Manifold<T> {
		return this.reduce<T>(
			// Extra parameters to reduce ignored: path: Array<number>, thisArray: RecursiveArray<T>
			(accumulator: Manifold<T>, element: T | RecursiveArray<T>) =>
				accumulator._append(
					isRecursiveArray(element) ? element : [element]
				)
		)
	}

	static flatten<U>(manifold: Manifold<Manifold<U>>): Manifold<U> {
		/* An alias of '.join()', but communicates 'flattening' to TypeScript. 
		The .join() operation should flatten M<M<T>> -> M<T>, but we can't 
		communicate this via type-signatures on a method. */
		return manifold.join() as any as Manifold<U>
	}
	static _flatten<U>(manifold: Manifold<RecursiveArray<U>>): Manifold<U> {
		return manifold.join() as any as Manifold<U>
	}


	// Functional
	map<U>(f: (value: T|RecursiveArray<T>,
			    path: Array<number>,
			    thisArray?: RecursiveArray<T | RecursiveArray<T>>
		        ) => U,
		   initial_path?: Array<number>
	): Manifold<U> {
		/* Map, rewritten to use 'reduce' and 'append'. Requires adapting
		'f' to fit the accumulator-function for .reduce() */
		return this.reduce<U>(
			(accumulator, element, path, thisArray) => 
				accumulator.append(accumulator.lift<U>([f(element, path, thisArray)]))
		);

	}
	_map<U>(f: (value: T|RecursiveArray<T>,
			   path: Array<number>,
			   thisArray?: RecursiveArray<T | RecursiveArray<T>>
		       ) => U,
		   initial_path?: Array<number>
	): Manifold<U> {
		/* A more efficient & lower-level version of map, which uses
		to the lower-level Array.map, rather than the Manifold.append and
		Manifold.reduce methods
		*/
		return this.lift<U>(
			this.data.map<U>(
				(value, index, thisArray) => f(value, initial_path.concat([index]), thisArray)
			)
		)
	}

	bind<U>(f: (value: T | RecursiveArray<T>,
				path: Array<number>,
				thisArray?: RecursiveArray<T | RecursiveArray<T>>
				) => Manifold<U>,
			initial_path?: Array<number>
	): Manifold<U> {
		return Manifold.flatten<U>(this.map<Manifold<U>>(f, initial_path))
	}
	_bind<U>(f: (value: RecursiveArray<T> | T,
		        path: Array<number>,
		        thisArray: RecursiveArray<T>
		        ) => RecursiveArray<U>,
			initial_path?: Array<number>
	): Manifold<U> {
		/* Lower-level efficient implementation of bind. */
		return Manifold._flatten<U>(
			this._map<RecursiveArray<U>>(f, initial_path)
		);
	}

	traverse<U>(
		f: (elm: T,
			path: Array<number>,
			manifold: Manifold<T>
			) => Manifold<U>,
		initial_path?: Array<number>
	): Manifold<U> {
		return Manifold.traverse(this, f, initial_path);
	}

	_traverse<U>(f: (elm: T,
					 path: Array<number>,
					 thisArray: RecursiveArray<T>
					 ) => RecursiveArray<U>,
				 initial_path: Array<number> = []
	): Manifold<U> {
		return Manifold._traverse<T, U>(this, f, initial_path)
		// return this.lift<U>(traverseArray(f, this.data, [] as Array<number>))
	}

	static traverse<T, U>(
		manifold: Manifold<T>,
		f: (elm: T,
			path: Array<number>,
			thisManifold: Manifold<T>
			) => Manifold<U>,
		initial_path?: Array<number>
	): Manifold<U> {
		return manifold.reduce(
			(acc: Manifold<U>, elm, path) => acc.append(
				isRecursiveArray(elm) ?
					Manifold.traverse(Manifold.lift<T>(elm), f) :
					f(elm, path, manifold)
			)
		)
	}

	static _traverse<T, U>(
		manifold: Manifold<T>,
		f: (elm: T,
			path: Array<number>,
			thisArray: RecursiveArray<T>
			) => RecursiveArray<U>,
		initial_path: Array<number> = []
	): Manifold<U> {
		return Manifold.lift<U>(
			traverseArray<T, U>(f, manifold.data, initial_path)
		)
	}

}


export class Manifold<T> extends ManifoldBase<T> implements IManifold<Coordinate, T> {
	/*
	The static side of the Manifold implementation.
	Provides a constructor.
	 */

	constructor(
		public data: RecursiveArray<T>
	) {
		super()
	}


	fold<U>(f: (accumulator: U,
				 element: T | RecursiveArray<T>,
				 path: Array<number>,
				 thisManifold?: Manifold<T>
				 ) => U,
			 initial: U,
			 initial_path: Array<number> = []
	): U {
		// Adapt to Array.reduce(..., index: number) from path: Array<number>
		return this.data.reduce<U>(
			(acc: U, elm: T|RecursiveArray<T>, i: number, array: RecursiveArray<T | RecursiveArray<T>>) =>
				f(acc, elm, initial_path.concat([i]), this),
			initial)
	}
	_fold<U>(f: (accumulator: U,
				 element: T | RecursiveArray<T>,
				 path: Array<number>,
				 thisArray?: RecursiveArray<T>
				 ) => U,
			 initial: U,
			 initial_path: Array<number> = []
	): U {
		// Adapt to Array.reduce(..., index: number) from path: Array<number>
		return this.data.reduce<U>(
			(acc: U, elm: T|RecursiveArray<T>, i: number, array: RecursiveArray<T | RecursiveArray<T>>) =>
				f(acc, elm, initial_path.concat([i]), this.data),
			initial)
	}


	// Static/instance switching & type-theoretic
	static is<U>(value: any): value is Manifold<U> {
		// Enhance this function. It is too permissive atm
		return ((value.data !== undefined))
	}
	static lift<U>(data: RecursiveArray<U>): Manifold<U> {
		return new (this.constructor as Buildable<Manifold<U>>)(data);
	}
	static zero<U>(): Manifold<U> {
		return new (this.constructor as Buildable<Manifold<U>>)([]);
	}

}



/*
	This is a good candidate for seperating the static and instance interfaces

	Since it should *NOT* inherit the static interface BUT should for instances
 */
class SubManifold<T> extends ManifoldBase<T> implements ISubManifold<Coordinate, T> {
	/*
	@todo: Test this in relation to the static methods -- particularly the traverse. Is supect it will not work correctly.


	This must override:
		get
		set
		delete
		data
		fold
		_fold

	 */


	constructor(
		public parent: Manifold<T>,
		public coordinate_in_parent: Coordinate
	) {
		super();
	}

	convert_coordinate(coordinate: Coordinate): Coordinate {
		return this.coordinate_in_parent.append(coordinate)
	}
	static is<T>(value: any): value is SubManifold<T> {
		return (Manifold.is(value)
				&& Manifold.is(value.parent)
				&& Coordinate.is(value.coordinate_in_parent))
	}

	get data(): RecursiveArray<T> {
		return this.parent._get(this.coordinate_in_parent);
	}

	/*  Examples
	convert_coordinate(coordinate: C): PC {
		// Hard part: ensuring that coordinate-conversion chains for deeply nested submanifolds
		return this.coordinates_in_parent.append(coordinate)
	}
	get(coordinate: C): T {
		// Given coordinates in this submanifold, return result from the parent manifold
		return this.parent.get(this.convert_coordinate(coordinate))
	}
	set(coordinate: C, value: T): void {
		return this.parent.set(this.convert_coordinate(coordinate), value)
	}
	 */
	toArray(): RecursiveArray<T> {

		return this.parent._get(this.coordinate_in_parent);
	}
}
