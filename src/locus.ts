import {zip} from './support';
import {CoordinatesInterface, KindInterface} from './interfaces';
import {AllKinds} from './agents';


/**
 * ADd these notes on Grid & Point to the original classes
 */
export class Grid {


}



export interface LocusInterface<T> {
	/**
	 *
	 * Assumed to be homogenous (all arrays at a given depth are the same size).
	 *
	 * Why do we have flatMap? Answer: for things like neighborCoordinates, where you
	 * generate multiple points from a single point
	 */
	map(func: (value: LocusInterface<T> | T) => LocusInterface<T> | T): this;
	flatten(): this;
	flatMap(func: (value: LocusInterface<T> | T) => LocusInterface<T> | T): this; // basically bind
	append(locus: this): this;


	dimension: number;  // Probably a getter property
	sizes: number;  // Probably a getter property
	coordinates: number[]; // For toplevel Locus, this should be []

	neighbors(locus: LocusInterface<T>): Array<LocusInterface<T>>;
	protected neighborCoordinates(coordinates: number[]): Array<Array<number>>;
	isNearby(first: LocusInterface<T>)
	
	compare(value: any): Boolean;
	// Constructors and converters
	zero(): this;
	toString(): string;
}


export interface PointInterface extends LocusInterface<number> {
	coordinates: number[];

	map(func: (point: this) => this): this;
	comparePoint(other: this): Boolean;
	mapCoordinates(func: (value: number, index?: number, thisValues?: Array<number>) => number): this;
	add(PointInterface: this): this;
	invert(): this;
	subtract(PointInterface: this): this;
	isNearby(point: this, delta: number): Boolean;

	// Constructors and converters
	fromArray(values: number[]): this;
	fromPoint(point: this): this;
	zero(): this;
}

export class UpdatedGridInterface<T> implements LocusInterface<T> {
	sizes: number[];
	contains(point: PointInterface): Boolean {
		if (!this.containsCoordinates(point.coordinates)) {
			return false;
		} else {
			return point.compare(this.fetch(point.coordinates));
		}
	}
	containsCoordinates(coordinates: number[]) {
		return zip(coordinates, this.sizes).every(([coord, size]) => (coord <= size));
		// return zip(coordinates, this.sizes).every(function([coordinate, size]: [number, number]) {
		// 	return (coordinate < size)
		// })
	}
}

export class UpdatedPointBase implements PointInterface {
	constructor(
		public coordinates: CoordinatesInterface,
		public kind: KindInterface = AllKinds.empty()
	) { };
	map(func: (point: this, index?: number) => this): this {
		/**
		 * Very basic map function. Exists to provide easier mapping behavior on grids.
		 * (so you can call map on a row of a grid, or on a point of a grid), without reflecting
		 * on the type of the object (grid/row/point)
		 */
		return func(this);
	}
	toString(): string {
		// I don't know if this is a valid expression inside a template or not...
		//   ... so for now, it's getting a local variable...
		let inner = this.coordinates.join(", ");
		return "[${inner}]";
	}
	compare(value: any) {
		if (value instanceof Point) {
			return this.comparePoint(value)
		} else {
			return false;
		}
	}
	comparePoint(point: Point): Boolean {

	}
}