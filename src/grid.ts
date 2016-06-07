/**
 * Point class hierarchy is unnecessarily complex,
 * as an exercise in learning TypeScript/ES6 classes
 */

import {PointInterface, GridInterface, KindInterface, Buildable} from './interfaces';
import {Kind, AllKinds, CumulativeDistribution} from './agents';



// export class PointBase implements PointInterface {
// export class PointBase implements ConstructibePointInterface {
export class PointBase implements ConstructiblePoint {
	/**
	 * Base class shared by all point implementations.
	 * Concrete point classes vary by their dimensionality.
	 */
	constructor(
		public coordinates: Array<number>,
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

	map(func: (value: number, index?: number, thisValues?: Array<number>) => number): this {
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

	invert(): this {
		return this.map((x, index, thisValues) => -x);
	}

	add(right: this): this {
		return this.fromArray(
			this.coordinates.map((value: number, index: number, array: number[]) => value + right[index])
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
	constructor(coordinates: Array<number> = [0, 0], kind: KindInterface = AllKinds.empty()) {
		assert(coordinates.length == 2)
		super(coordinates, kind)
	}
}

export class Point3D extends PointBase {
	constructor(coordinates: Array<number> = [0, 0, 0], kind: KindInterface = AllKinds.empty()) {
		assert(coordinates.length == 3)
		super(coordinates, kind)
	}
}



/**
 * Grid Classes
 */
export abstract class GridBase<PointClass extends PointBase> implements GridInterface {
	Point: PointClass;
	size: number[];
	points: Array<any | PointClass>;  // Recursive data type. type T = Array<T> | T;

	makePoint(coordinates: number[]): PointClass {
		return this.Point.constructor.apply({}, coordinates);
	}
	protected fetch(coordinates: number[]): any {
		assert(this.size.length >= coordinates.length);
		let lense = this.points;
		coordinates.forEach((coordinate) => lense = lense[coordinate]);
		return lense;
	}
	getPoint(coordinates: number[]): PointClass {
		return this.fetch(coordinates) as any as PointClass;
	}
	setPoint(coordinates: number[], kind: Kind): PointClass {
		this.fetch(coordinates) = kind;
	}
}

/*
function Init3DimensionalArray(xmax, ymax, zmax, def) {
    var r, x, y, z;
    for (r = [], x = 0; x < xmax; x++)
        for (r [x] = [], y = 0; y < ymax; y++)
             for (r [x][y] = [], z = 0; z < zmax; x++)
                  r [x][y][z] = def;
    return r;
}
var my3DimArray = Init3DimensionalArray(5, 4, 3, 0);
 */


function product<T>(...pools: Array<Array<T>>): Array<Array<T>> {
	/* Cartesian product of arrays.
	product(['A', 'B', 'C', 'D'], ['x', 'y']) --> [['A', 'x'], ['A', 'y'], ['B', 'x'], ...]
	*/
	let accumulator: Array<Array<T>> = [[]];
	pools.forEach(function(pool) {
		var temp: Array<Array<T>> = [];
		accumulator.forEach(function(prior) {
			pool.forEach(function(entry) {
				let _t = prior.slice();
				_t.push(entry)
				temp.push(_t)
			});
		})
		accumulator = temp;
	})
	return accumulator;
}


function range(start: number, stop: number, step: number = 1) {
	/* Modified from Underscore's range() function. */
    let length = Math.max(Math.ceil((stop - start) / step), 0);
    let range = Array(length);
    for (let idx = 0; idx < length; idx++ , start += step) {
		range[idx] = start;
    }
    return range;
};

function assert(value: Boolean, message: string = "Invalid assertion.") {
	if (!value) {
		throw Error(message)
	}
}