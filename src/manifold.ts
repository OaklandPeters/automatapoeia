/**
 *
 *
 * Usage would look like:
 * type Kind = {};
 * class Grid extends Manifold<Coordinate, Kind> {}
 */
import {Buildable, assertType} from './support';
import {RecursiveArray, isRecursiveArray, traverseArray, isArray} from './support';

export interface ICoordinate extends Array<number> {
	dimension: number;
}

export interface IManifold<C extends ICoordinate, T> {
	// data: RecursiveArray<T>;

	// Accessors
	get(coordinate: C): T | ISubManifold<C, T>;
	set(coordinate: C, cell: T | RecursiveArray<T>): void;
	delete(coordinate: C): void;

	// Group-theoretic
	// -------	
	// This should fold along the top-level, and allow for recursion into the lower levels
	// So... fold might actually have the signature:
	// 		fold<U>(f: (first: U, second: IManifold<T> | T) => U, initial: U): U
	// 		
	// 		
	// Hard-question
	// -------------------
	// should fold/reduce expect to dispatch on T | SubManifold OR T | RecursiveArray??
	fold<U>(f: (first: U, second: T | ISubManifold<C, T>) => U, initial: U): U;
	zero<_C extends ICoordinate, _T>(): IManifold<_C, _T>;
	reduce<U>(f: (accumulator: IManifold<C, U>, element: T | ISubManifold<C, T>) => IManifold<C, U>): IManifold<C, U>;
	append(other: IManifold<C, T>): IManifold<C, T>;
	join(): IManifold<C, T>;

	// Functional
	// Functional methods, that involve coordinate information
	// ... this can probably be adapted ontop of simple map/bind/traverse,
	// but I don't know how to write those metafunctions atm
	map<U>(f: (value: T, path: C, thisManifold: IManifold<C, T>) => U): IManifold<C, U>;
	// traverse/bind MIGHT return ISubManifold<> instead, I'm not sure
	bind<U>(f: (value: T, path: C, thisManifold: IManifold<C, T>) => IManifold<C, U>): IManifold<C, U>;
	traverse<U>(f: (value: T, path: C, thisManifold: this) => IManifold<C, U>): IManifold<C, U>;
	
	// Extended Utility
	// enumerate(): Array<[C, T]>;
}

function isIManifold<C extends ICoordinate, T>(value: any): value is IManifold<C, T>  {
	// I really don't know what I should be checking here
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
	get dimension() {
		return this.length;
	}

	static is(value: any): value is Coordinate {
		if ((value.length !== undefined) && (typeof value.every === 'function')) {
			return value.every((x: any) => (typeof x === 'number'))
		}
		return false
	}

	append(items: Array<number>): this {
		/* Array.concat, but that function has problems with the return type
		being always 'Array'. */
		return super.concat(items) as any as this
	}
}


export class Manifold<T> implements IManifold<Coordinate, T>{
	/*
	Generic arbitary-dimensional array-like object.

	An abstraction of the grid class, that doesn't know the type of the Cell
	it contains.
	Why?  So that 'map' can return a Grid containing a different type of cell.

	@todo: data should probably be protected, but this i=pisses off the IManifold,
	because I don't know how to specify 'protected' in an interface
	 */
	constructor(
		public data: RecursiveArray<T>
	) { }

	makeSubManifold(coordinate: Coordinate) {
		// Temporary hack on this type conversion. @todo: remove it
		return new SubManifold<T>(this as any as IManifold<Coordinate, T>, coordinate)
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

	toArray(): RecursiveArray<T> {
		return this.data
	}

	protected _check_coordinate(coordinate: Coordinate): void {
		if (coordinate.dimension > this.dimension) {
			throw `coordinate of length ${coordinate.dimension} is too large to index into manifold of length ${this.dimension}`;
		}
	}
	protected _check_point_invariant(coordinate: Coordinate, value: T | Manifold<T>): void {
		/* Confirms this is true: 
		coordinate.dimension + value.dimension  == this.dimension */
		let value_dimension = SubManifold.is<Coordinate,T>(value) ? value.dimension : 0;
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
		if (Manifold.is<Coordinate, T>(value)) {
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
	lift<U>(data: RecursiveArray<U>): Manifold<U> {
		return new (this.constructor as Buildable<Manifold<U>>)(data);
	}
	zero<U>(): Manifold<U> {
		return new (this.constructor as Buildable<Manifold<U>>)([]);
	}

	// Group-theoretic operations  (reference internal array)
	fold<U>(f: (accumulator: U, element: RecursiveArray<T> | T) => U, initial: U): U {
		return this.data.reduce<U>(f, initial)
	}
	reduce<U>(f: (accumulator: Manifold<U>, element: RecursiveArray<T> | T) => Manifold<U>) {
		return this.fold<Manifold<U>>(f, this.zero<U>())
	}
	append(other: RecursiveArray<T>): Manifold<T> {
		return this.lift<T>(this.data.concat(other))
	}
	join(): Manifold<T> {
		return this.reduce<T>((accumulator: Manifold<T>, element: RecursiveArray<T>| T) =>
			accumulator.append(
				isRecursiveArray(element) ? element : [element]
			)
		)
	}

	// Functional
	map<U>(f: (value: RecursiveArray<T> | T, path: Array<number>) => U): Manifold<U> {
		let path: Array<number> = [];
		return this.lift<U>(this.data.map<U>((x, i) => f(x, path.concat([i]))))
	}
	// map<U>(f: (value: RecursiveArray<T> | T, path: Array<number>) => U): Manifold<U> {
	// 	function adaptor(x: RecursiveArray<T>|T, p: Array<number>): RecursiveArray<U>|U {
	// 		if (isRecursiveArray(x)) {
	// 			// return x.map((elm, i) => adaptor(elm, p.concat([i])))
	// 			return x.map(function(elm: T|RecursiveArray<T>, i: number): RecursiveArray<U>|U{
	// 				return adaptor(elm, p.concat([i]))
	// 			})
	// 		} else {
	// 			return f(x, p)
	// 		}
	// 	}
	// 	// let val = this.data.map((x) => x) // Array<RecursiveArray<T>|T>
	// 	return this.data.map<U>(adaptor);
	// }

	bind<U>(f: (value: RecursiveArray<T> | T, path: Array<number>) => U): Manifold<U> {
		let path: Array<number> = [];
		return this.map<U>(f).join()
	}
	traverse<U>(f: (value: RecursiveArray<T> | T, i: number) => U): Manifold<U> {
		function adaptor(x: RecursiveArray<T> | T, path: Array<number>) {
			
		}
	}




	_traverse(){
		return locus.reduce(
			function(accumulator: RecursiveArray<U>, elm: T|RecursiveArray<T>, index: number, innerThisArray: RecursiveArray<T>): RecursiveArray<U> {
				let new_path = path.slice().concat([index])
				if (isArray(elm)){
					return accumulator.concat([
						traverseArray(f, elm, new_path)
					])
				} else {
					return accumulator.concat(f(elm, new_path, innerThisArray))
				}
			}
		, [] as RecursiveArray<U>
		)
	}
}

class SubManifold<T> extends Manifold<T> {
	constructor(
		public parent: IManifold<Coordinate, T>,
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
