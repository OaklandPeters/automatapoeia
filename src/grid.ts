import {PointInterface, GridInterface} from './interfaces';


/**
 * Point class hierarchy is unnecessarily complex,
 * as an exercise in learning TypeScript/ES6 classes
 *
 * Improvements:
 * [] Reflect to access constructor. 'npm install babel-polyfill --save'
 *    Allows: Reflect.construct(MyPoint: Point, values: number[])
 *    http://babeljs.io/docs/usage/polyfill/
 */


export abstract class PointBase implements PointInterface {
	/**
	 * Base class shared by all point implementations.
	 * Concrete point classes vary by their dimensionality.
	 */
	values: Array<number>;
	constructor(values: Array<number>) {
		this.values = values;
	};

	abstract fromArray(values: number[]): this;
	abstract zero(): this;

	fromPoint(point: this): this {
		return this.fromArray(this.values);
	}

	toString(): string {
		// I don't know if this is a valid expression inside a template or not...
		//   ... so for now, it's getting a local variable...
		let inner = this.values.join(", ");
		return "[${inner}]";
	}

	map(func: (value: number, index: number, thisValues: Array<number>) => number): this {
		return this.fromArray(
			this.values.map(
				(val: number, ind: number, array: number[]) => func(val, ind, this.values)
			)
		);
	}

	invert(): this {
		return this.map((x, index, thisValues) => -x);
	}

	add(right: this): this {
		return this.fromArray(
			this.values.map((value: number, index: number, array: number[]) => value + right[index])
		);
	}

	subtract(right: this): this {
		return this.fromPoint(this.add(right.invert()));
	}

	compare(right: this, delta: number): Boolean {
		let temp = this.subtract(right).values;
		return temp.every((value, index, array) => (value <= delta));
	}
}


/**
 * Concrete point classes
 */
export class Point1D extends PointBase {
	fromArray(values: number[]): this {
		// return new this.constructor(values);
		return new Point1D(values) as this;
	}
	zero(): this {
		return new Point1D([0]) as this;
	}
	get x(): number {
		return this.values[0];
	}
	set x(value: number) {
		this.values[0] = value;
	}
}

export class Point2D extends PointBase {
	fromArray(values: number[]): this {
		return new Point2D(values) as this;
	}
	zero(): this {
		return new Point2D([0, 0]) as this;
	}
	get y(): number {
		return this.values[1];
	}
	set y(value: number) {
		this.values[1] = value;
	}
}

export class Point3D extends Point2D {
	fromArray(values: number[]): this {
		return new Point3D(values) as this;
	}
	zero(): this {
		return new Point3D([0, 0, 0]) as this;
	}
	get z(): number {
		return this.values[2];
	}
	set z(value: number) {
		this.values[2] = value;
	}
}

export class GridBase implements Grid {

}