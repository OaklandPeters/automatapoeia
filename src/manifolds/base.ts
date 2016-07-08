/**
 *
 *	Challenge: complication - the proxy can be *partly* handled, by just getting
 *	the 'data' object, but that doesn't handle the setting/getting behavior.
 *		Solution: provide an abstract MutableSequence interface.
 *
 * Challenge - simplifying this. It's much too complicated atm.
 * 
 * @todo: Move Coordinate stuff to its own file
 * @todo: traverse maybe should be defined in terms of bind
 *
 * Usage would look like:
 * type Kind = {};
 * class Grid extends Manifold<Coordinate, Kind> {}
 */

import {Buildable, assertType} from '../support';
import {RecursiveArray, isRecursiveArray, traverseArray, isArray, flattenArray} from '../support';

import {IManifold, ISubManifold, ICoordinate} from './interfaces';
import {Coordinate, LeafCoordinate, StemCoordinate} from './coordinates';


export abstract class ManifoldBase<T> implements IManifold<Coordinate, T> {
	/*
	Generic arbitary-dimensional array-like object.

	An abstraction of the grid class, that doesn't know the type of the Cell
	it contains.
	Why?  So that 'map' can return a Grid containing a different type of cell.

	
	_reduce, _map, _bind, _traverse - are more efficient, but access the underlying
	data representation, so do not generalize to SubManifold


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


	/* Abstract methods & properties
	================================== */
	data: RecursiveArray<T>;
	dimension: number;

	abstract append(other: Manifold<T>): Manifold<T>;
	abstract _append(other: RecursiveArray<T>): Manifold<T>;
	abstract toArray(): RecursiveArray<T>;

	/* Convenience constructors & converters
	=========================================== */
	abstract subManifold(coordinate: Coordinate): SubManifold<T>;
	abstract coordinate(values: Array<number>): Coordinate;







	// Protected/private accessors
	// Accessors for potentially deeply nested internal arrays
	// These would be protected, but SubManifolds into this Manifold
	// need access to it.
	protected _set(coordinate: Coordinate, value: T | RecursiveArray<T>): void {
		Coordinate.assertInManifold(coordinate, this)
		let front = coordinate.slice(0, -1) as Coordinate;
		let last = coordinate.slice(-1)[0];
		let deepestArray = this.get(front);	
		deepestArray[last] = value;
		return;
	}
	protected _get(coordinate: Coordinate): T | RecursiveArray<T> {
		Coordinate.assertInManifold(coordinate, this)
		let lense: T | RecursiveArray<T> = this.data;
		coordinate.forEach((coord) => (lense = lense[coord]));
		return lense;
	}
	protected _delete(coordinate: Coordinate): void {
		Coordinate.assertInManifold(coordinate, this)
		let front = coordinate.slice(0, -1) as Coordinate;
		let last = coordinate.slice(-1)[0];
		let deepestArray = this.get(front);
		delete deepestArray[last];
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
		 if (Manifold.is<T>(value)) {
		 	this.setStem(coordinate, value);
		 } else {
		 	this.setLeaf(coordinate, value);
		 }
	}
	delete(coordinate: Coordinate): void {
		let front = coordinate.slice(0, -1) as Coordinate;
		let last = coordinate.slice(-1)[0];
		let deepestArray = this.get(front);
		delete deepestArray[last];
	}



	// Group-theoretic operations  (reference internal array)
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
			    thisManifold?: Manifold<T>
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

	/* Constructors and Converters
	======================================== */
	constructor(
		public data: RecursiveArray<T>
	) {
		super()
	}

	toArray(): RecursiveArray<T> {
		return this.data
	}

	subManifold(values: Array<number>): SubManifold<T> {
		return new SubManifold(this, this.coordinate(values));
	}

	coordinate(values: Array<number>): Coordinate {
		return new Coordinate(values, this)
	}

	// Static/instance switching & type-theoretic
	lift<U>(data: RecursiveArray<U>): Manifold<U> {
		// Lift on a submanifold should return a new Manifold, not SubManifold
		return Manifold.lift<U>(data);
	}
	zero<U>(): Manifold<U> {
		return Manifold.zero<U>();
	}





	append(other: Manifold<T>): Manifold<T> {
		return this._append(other.data)
	}
	_append(other: RecursiveArray<T>): Manifold<T> {
		/* Alternate version of append, used for efficiency, by avoiding
		allocating an extra Manifold, just to append it to an accumulator.*/
		return this.lift<T>(this.data.concat(other))
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


	// Accessors with more definite return types (IE not union types).
	getLeaf(coordinate: Coordinate): T {
		return this._get(LeafCoordinate.assert(coordinate)) as T
	}
	setLeaf(coordinate: Coordinate, value: T): void {
		return this._set(LeafCoordinate.assert(coordinate), value)
	}
	getStem(coordinate: Coordinate): SubManifold<T> {
		// return this.subManifold(StemCoordinate.assert(coordinate))
		return this.subManifold(StemCoordinate.assert(coordinate))
	}
	_getStem(coordinate: Coordinate): RecursiveArray<T> {
		return this._get(StemCoordinate.assert(coordinate)) as RecursiveArray<T>
	}
	setStem(coordinate: Coordinate, value: Manifold<T>) {
		// this._set(StemCoordinate.assert(coordinate), value.toArray())
		this._setStem(coordinate, value.toArray())
	}
	_setStem(coordinate: Coordinate, value: RecursiveArray<T>): void {
		this._set(StemCoordinate.assert(coordinate), value)
	}
	getRoot(): Manifold<T> {
		return this;
	}
	_getRoot(): RecursiveArray<T> {
		return this.data;
	}
	setRoot(value: Manifold<T>): void {
		this.data = value.data;
	}
	_setRoot(value: RecursiveArray<T>): void {
		this.data = value;
	}


}



/*
	This is a good candidate for seperating the static and instance interfaces

	Since it should *NOT* inherit the static interface BUT should for instances
 */
export class SubManifold<T> extends ManifoldBase<T> implements ISubManifold<Coordinate, T> {
	/*
	@todo: Test this in relation to the static methods -- particularly the traverse. Is supect it will not work correctly.


	This must override:
		fold
		_fold
		append
		_append
	 */


	constructor(
		public parent: Manifold<T>,
		public coordinate_in_parent: Coordinate
	) {
		super();
	}

	project(coordinate: Coordinate): Coordinate {
		return this.coordinate_in_parent.append(coordinate)
	}

	static is<T>(value: any): value is SubManifold<T> {
		return (Manifold.is(value)
				&& Manifold.is(value.parent)
				&& Coordinate.is(value.coordinate_in_parent))
	}

	// lift<U>(data: RecursiveArray<U>): SubManifold<U>

	get data(): RecursiveArray<T> {
		return this.parent._getStem(this.coordinate_in_parent);
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


	getLeaf(coordinate: Coordinate): T {
		return this.parent.getLeaf(this.project(coordinate))
	}
	setLeaf(coordinate: Coordinate, value: T): void {
		return this.parent.setLeaf(this.project(coordinate), value)
	}
	
	getStem(coordinate: Coordinate): SubManifold<T> {
		return this.parent.getStem(this.project(coordinate))
	}
	setStem(coordinate: Coordinate, value: Manifold<T>): void {
		return this.parent.setStem(this.project(coordinate), value)
	}

	getRoot(): SubManifold<T> {
		return this.parent.getStem(this.coordinate_in_parent);
	}
	setRoot(value: Manifold<T>): void {
		return this.parent.setStem(this.coordinate_in_parent, value)
	}


	/* Correcting type-declarations
	==================================
	Funcitons which are correct as inherited,
	but whose interfaces are now wrong. */
	append(other: Manifold<T>): SubManifold<T>;
	reduce<U>(f: (accumulator: Manifold<U>,
				 element: T | RecursiveArray<T>,
				 path: Array<number>,
				 thisManifold?: Manifold<T>
				 ) => Manifold<U>,
			 initial_path: Array<number> = []
	): Manifold<U>;
	join(): Manifold<T>;
	// static flatten;
	map<U>(f: (value: T|RecursiveArray<T>,
			    path: Array<number>,
			    thisManifold?: Manifold<T>
		        ) => U,
		   initial_path?: Array<number>
	): Manifold<U>;
	bind<U>(f: (value: T | RecursiveArray<T>,
				path: Array<number>,
				thisArray?: RecursiveArray<T | RecursiveArray<T>>
				) => Manifold<U>,
			initial_path?: Array<number>
	): Manifold<U>;
	traverse<U>(
		f: (elm: T,
			path: Array<number>,
			manifold: Manifold<T>
			) => Manifold<U>,
		initial_path?: Array<number>
	): Manifold<U>;



	/* Group theory operations
	==========================================	
	 */



	mapIn(f: (value: T|RecursiveArray<T>,
			    path: Array<number>,
			    thisManifold?: Manifold<T>
		        ) => T,
		   initial_path?: Array<number>
	): SubManifold<T> {
		/*
		Maps this submanifold, then mutates it in the parent.

		This is acomplished, by 
		*/
	
		let new_data = this.data.map<U>(
			(value, index, thisArray) => f(value, initial_path.concat([index]), thisArray)
		);
		this.parent.set(this.coordinate)



		let self = this as SubManifold<T>;

		function adaptor(value: T|RecursiveArray<T>,
			    path: Array<number>,
			    thisManifold?: Manifold<T>): T {
			// Map using function 'f', and update the parent afterward
			let result = f(value, path, thisManifold);
			let coordinate = new Coordinate(path, self);
			self.set(coordinate, result)
			return result;
		}
		let v1 = this.map<T>(adaptor, initial_path);


	}


	/* Constructors and converters
	==========================================
	 */
	toArray(): RecursiveArray<T> {
		return this.data;
	}
	coordinate(values: Array<number>): Coordinate {
		return new Coordinate(values, this)
	}
	subManifold(coordinate: Coordinate): SubManifold<T> {
		Coordinate.assertInManifold(coordinate, this);
		return new SubManifold(this, coordinate)
	}
}

var x = Manifold([1, 2]);
x