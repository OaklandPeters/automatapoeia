/**
 * Grid and Point class hierarchy.
 * The ability to lookup based on coordinates is two way between Point<-->Grid.
 * 
 */

import {PointInterface, GridInterface, KindInterface, OrderedActionsInterface, ActionInterface, CoordinatesInterface, Buildable} from './interfaces';
import {Kind, AllKinds} from './agents';
import {Distribution, CumulativeDistribution, uniformDistribution} from './distribution';
import {assert, range, shove} from './support';


export class PointBase implements PointInterface {
	/**
	 * Base class shared by all point implementations.
	 * Concrete point classes vary by their dimensionality.
	 */
	constructor(
		public coordinates: CoordinatesInterface,
		public kind: KindInterface = AllKinds.empty()
	) { };

	fromArray(coordinates: number[]): this {
		return new (this.constructor as Buildable<this>)(this.coordinates, AllKinds.empty());
	}

	fromPoint(point: this): this {
		// return new this.constructor(this.coordinates, this.kind);
		return new (this.constructor as Buildable<this>)(point.coordinates, point.kind);
	}

	zero(): this {
		return new (this.constructor as Buildable<this>)();
		// return new this.constructor([0, 0], AllKinds.empty())
	}

	toString(): string {
		// I don't know if this is a valid expression inside a template or not...
		//   ... so for now, it's getting a local variable...
		let inner = this.coordinates.join(", ");
		return "[${inner}]";
	}

	mapCoordinates(func: (value: number, index?: number, thisValues?: CoordinatesInterface) => number): this {
		/*
		Map over the points, but not the kind.
		This is currently immutable, which is inefficient. Either adopt a library for more
		efficiency, or change this to mutate in-place.
		*/
		return this.constructor(
			// This function in map looks complicated, but this is the actual call-signature
			// of Javascript's Built-in-map
			this.coordinates.map(
				(val: number, ind: number, array: number[]) => func(val, ind, this.coordinates)
			),
			this.kind
		)
	}

	map(func: (point: this, index?: number) => this): this {
		/**
		 * Very basic map function. Exists to provide the same exposed interface as Grid.
		 * (so you can call map on a row of a grid, or on a point of a grid), without reflecting
		 * on the type of the object (grid/row/point)
		 */
		return func(this);
	}

	unfold(func: (point: this, index?: number) => Array<this>): Array<this> {
		/**
		 * Very basic unfold function. Exists to provide the same exposed interface as Grid.
		 * (so you can call map on a row of a grid, or on a point of a grid), without reflecting
		 * on the type of the object (grid/row/point)
		 */
		return func(this);
	}

	invert(): this {
		return this.mapCoordinates((x, index, thisValues) => -x);
	}

	add(right: this): this {
		return this.fromArray(
			this.coordinates.map((value: number, index: number, array: number[]) => value + right.coordinates[index])
		);
	}

	subtract(right: this): this {
		return this.fromPoint(this.add(right.invert()));
	}

	compare(right: this, delta: number): boolean {
		let temp = this.subtract(right).coordinates;
		return temp.every((value, index, array) => (value <= delta));
	}
}


/**
 * Concrete point classes
 * Distinct to prevent mixing them up together, and to allow pairing the class with Grid classes.
 */
export class Point2D extends PointBase {
	constructor(coordinates: CoordinatesInterface = [0, 0], kind: KindInterface = AllKinds.empty()) {
		assert(coordinates.length == 2)
		super(coordinates, kind)
	}
}

export class Point3D extends PointBase {
	constructor(coordinates: CoordinatesInterface = [0, 0, 0], kind: KindInterface = AllKinds.empty()) {
		assert(coordinates.length == 3)
		super(coordinates, kind)
	}
}



/**
 * Grid Classes
 */





//
//		Current problem, GridInterface not knowing that it's inner type implements PointInterface
//

export function makeGrid<PointClass, GridClass>(sizes: CoordinatesInterface){
	/**
	 * @todo: This function should go onto model or gamestate, or similar. It involves all information necessary to setup an initialized grid.
	 * 
	 */
	
}



export function adjacentCoordinates(coordinates: CoordinatesInterface): Array<CoordinatesInterface> {
	/**
	 * Generate all coordinates one-number-off ('adjacent') to coordinates.
	 * These are not filtered for sanity, or even being greater than 0.
	 */
	let accumulator: CoordinatesInterface[] = [[]];
	coordinates.forEach(function(coordinate){
		let new_accumulator: CoordinatesInterface[] = []
		accumulator.forEach(function(partialCoordinates: CoordinatesInterface, index: number){
			new_accumulator.push(shove(partialCoordinates, coordinate - 1))
			new_accumulator.push(shove(partialCoordinates, coordinate))
			new_accumulator.push(shove(partialCoordinates, coordinate + 1))
		})
		accumulator = new_accumulator;
	})	
	return accumulator;
}

export class GridBase<PointClass extends PointBase> implements GridInterface<PointBase> {
	// Constructors
	constructor(
		public sizes: CoordinatesInterface,
		public Point: PointClass,
		public points: Array<any | PointClass> = [] // Recursive data type. type T = Array<T> | T;
	) { }

	initialize(distribution?: CumulativeDistribution<KindInterface>, history: number[] = []): this {
		if (typeof distribution === 'undefined') {
			distribution = uniformDistribution<Kind>(AllKinds.empty()).integral();
		}
		let accumulator: Array<GridBase<PointClass> | PointClass> = [];
		let first = this.sizes[0];
		let rest = this.sizes.slice(1);

		range(0, first).forEach(function(coordinate: number) {
			// Make new copy of history
			let memo: number[] = history.slice().push(coordinate);
			// let loci: GridBase<PointClass> | PointClass;

			if (typeof first === 'undefined') {
				// Make a point
				let loci: PointClass = new this.Point(memo, distribution.random());
				accumulator.push(loci);
			} else {
				// Make a grid of lower dimension
				// loci as GridBase<PointClass>;
				let loci: GridBase<PointClass> = new this.constructor(rest, this.Point);
				loci.initialize(distribution, memo);
				accumulator.push(loci);
			}
		})

		this.points = accumulator;
		return this;
	}

	// Utility methods - used for access deeply nested points
	protected getter(coordinates: CoordinatesInterface): any {
		assert(this.sizes.length >= coordinates.length);
		let lense = this.points;
		coordinates.forEach((coordinate) => lense = lense[coordinate]);
		return lense;
	}
	protected setter(coordinates: CoordinatesInterface, point: PointClass): void {
		let front = coordinates.slice(0, -1);
		let last = coordinates.slice(-1)[0];
		let deepestArray = this.getter(front);
		deepestArray[last] = point;
	}

	// Point functions
	makePoint(coordinates: CoordinatesInterface): PointClass {
		return this.Point.constructor.apply({}, coordinates);
	}
	getPoint(coordinates: CoordinatesInterface): PointClass {
		return this.getter(coordinates) as any as PointClass;
	}
	setPoint(coordinates: CoordinatesInterface, kind: Kind): void {
		let point = this.getter(coordinates);
		point
	}
	getNeighbors(coordinates: CoordinatesInterface): PointClass[] {
		let filteredCoordinates = adjacentCoordinates(coordinates).filter((value: number[], index: number, array: number[][]) => this.containsCoordinates(value))
		let accumulator: PointClass[] = [];
		filteredCoordinates.forEach(function(coordinates: CoordinatesInterface){
			accumulator.push(this.getPoint(coordinates))
		})
		return accumulator;		
	}
	containsCoordinates(coordinates: CoordinatesInterface): boolean {
		if (coordinates.length != this.sizes.length) {
			return false;
		} else {
			return coordinates.every((value, index) => (value <= this.sizes[index]))
		}
	}

	containsPoint(point: PointClass): boolean {
		return this.containsCoordinates(point.coordinates);
	}
	contains(loci: PointClass | CoordinatesInterface): boolean {
		if ((<PointClass>loci).coordinates !== undefined) {
			return this.containsPoint(loci)
		} else if ((loci as CoordinatesInterface)) {
			return this.containsCoordinates(loci);
		}
	}

	

	map(pointFunction: (point: PointInterface, index?: CoordinatesInterface, thisContainer?: this) => PointInterface): this {
		// Proxies the pointFunction call down the array of points.
		// This should be chained downward until it hits a 'Point' - whose map function will apply it
		return this.fromArray(
			this.points.map((thing, index, thisContainer) => thing.map(pointFunction, index, thisContainer))
		);
	}

	step(actions: OrderedActionsInterface): this {
		let grid = this;
		actions.map(function(action){
			grid = grid.map((point, index) => action.step(point, grid))
		});
		return grid;
	}


	html: HTMLScriptElement;  //document.getElementById("Grid");
	container: HTMLScriptElement;
	background: HTMLScriptElement;
	css: CSS;
}
