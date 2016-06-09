/**
 * Grid and Point class hierarchy.
 * The ability to lookup based on coordinates is two way between Point<-->Grid.
 * 
 */

import {PointInterface, GridInterface, KindInterface, OrderedActionsInterface, ActionInterface, CoordinatesInterface, Buildable} from './interfaces';
import {Kind, AllKinds} from './agents';
import {CumulativeDistribution} from './distribution';
import {assert} from './support';


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
		 * Very basic map function. Exists to provide easier mapping behavior on grids.
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

	compare(right: this, delta: number): Boolean {
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

export interface GridInterface<PointClass extends PointInterface> {
	initialize(distribution: CumulativeDistribution<KindInterface>): this;
	step(actions: OrderedActionsInterface): this;
	map(func: (point: PointClass, index?: CoordinatesInterface, thisValues?: this) => PointClass): this;
	// Point interaction methods
	makePoint(coordinates: number[]): PointClass;
	getPoint(coordinates: number[]): PointClass;
	setPoint(coordinates: number[], kind: KindInterface): void;
	getNeighbors(point: PointClass): Array<PointClass>;
	// HTML/CSS methods
	html: HTMLScriptElement;  //document.getElementById("Grid");
	container: HTMLScriptElement;
	background: HTMLScriptElement;
	css: CSS;
}

export function makeGrid<PointClass, GridClass>(sizes: CoordinatesInterface){
	/**
	 * @todo: This function should go onto model or gamestate, or similar. It involves all information necessary to setup an initialized grid.
	 * 
	 */
	
}


export class GridBase<PointClass extends PointInterface> implements GridInterface<PointClass> {
	Point: PointClass;
	sizes: CoordinatesInterface;
	points: Array<any | PointClass>;  // Recursive data type. type T = Array<T> | T;

	// Constructors
	constructor(size: CoordinatesInterface, Point: PointClass) {

	}
	fromPoints(sizes: CoordinatesInterface, points: PointClass) {

	}

	fromArray(points: PointClass[]) {
		return new (this.constructor as Buildable<this>)(...points);
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
	getNeighbors(point: PointClass): PointClass[] {
		let accumulator: PointClass[] = [];

		point.mapCoordinates(function(coord: number, index: number, coordinates: CoordinatesInterface): number {
			let before = coordinates.slice();
			// let before: CoordinatesInterface = coordinates.slice()[index] = coord - 1;
		})
	}

	map(pointFunction: (point: PointInterface, index?: CoordinatesInterface, thisContainer?: this) => PointInterface): this {
		// Proxies the pointFunction call down the array of points.
		// This should be chained downward until it hits a 'Point' - whose map function will apply it
		return this.fromArray(
			this.points.map((thing, index, thisContainer) => thing.map(pointFunction, index, thisContainer))
		);
	}
	initialize(distribution: CumulativeDistribution<KindInterface>): this {
		this.map((point: PointClass) => distribution.random());
		return this;
	}
	step(actions: OrderedActionsInterface): this {
		let grid = this;
		actions.map(function(action){
			grid = grid.map((point, index) => action.step(point, grid))
		});
		return grid;
	}
}
