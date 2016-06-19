/**
 *
 *
 * Coordinates
 * 
 * Point --> data
 * 		no coordinates
 * 		~doesn't know where it is
 *
 * Grid --> holds data points; structures & gives relationship to coordinates
 * 		mappable container
 *
 * Locus --> Point(s) + Grid + Coordinates
 * 		mappable container, and acts like a proxy to point(s)
 * 		~ a lense
 *   	ignorent of it's dimensionality
 *
 *
 * Open Questions:
 *  How to specify and encode the dimensionality.
 *  This touches on the coordinates (and can be affixed in the constructor)
 *  It also relates to the sizing of the grid, but I'm not sure how to handle that.
 */
import {KindInterface} from './interfaces';
import {RecursiveArray, RecursiveObject, assert, initializeArray, Buildable} from './support';
import {Kind, AllKinds} from './agents';


type Placeholder = any;

interface ICoordinate extends Array<number> {
	dimension: number;
}

interface ICell {
	kind: KindInterface
}

interface IGrid<_Cell extends ICell, _Coordinate extends ICoordinate> {
	data: RecursiveArray<_Cell>;
	// Accessors
	get(coordinate: _Coordinate): _Cell | RecursiveArray<_Cell>;
	set(coordinate: _Coordinate, cell: _Cell | RecursiveArray<_Cell>): void;
	delete(coordinate: _Coordinate): void;

}

interface IPoint<_Cell extends ICell, _Coordinate extends ICoordinate, _Grid extends IGrid<_Cell, _Coordinate>> {
	/*
	A type of lense into a grid.
	 */
	grid: _Grid;
	coordinate: _Coordinate;
	cell: _Cell;

	new(grid: _Grid, coordinate: _Coordinate, cell: _Cell): this;


	// Needs: map cell, and update grid with it
	// 		map cell, returning a new point
	// 		map cell, changing this one, but not updating the grid
	// setCell(cellFunc: (cell: _Cell) => _Cell): this;
	// update(): _Grid;
	
}



// 
function mapSet<P extends IPoint<any, any, any>>(point: P, cellFunc: (cell: ICell) => ICell): P {
	/*
	An example of how this might work for 
	Key part: it also affects the parent grid.
	*/
	let newCell = cellFunc(point.cell);
	let newGrid = point.grid.setCell(point.coordinate, newCell);
	return new point.prototype.constructor(
		newGrid,
		point.coordinate,
		newCell
	);
}


interface ILocus<_Cell extends ICell, _Coordinate extends ICoordinate, _Grid extends IGrid<_Cell, _Coordinate>, _Point extends IPoint<_Cell, _Coordinate, _Grid>> {
	grid: _Grid;
	points: Array<_Point>;
}






//
//	Implementations
//
class Coordinate extends Array<number> implements ICoordinate {
	get dimension() {
		return this.length;
	}
}

class Cell implements ICell {
	constructor(
		public kind: KindInterface
	) { }
	static is(value: any): value is Cell {
		/*
		Runtime type matching for Cell. Used to determine the bottom of recursive descent in Grids.
		 */
		return (value.kind !== undefined)
	}
}

class Grid implements IGrid<Cell, Coordinate> {
	data: RecursiveArray<Cell>;

	constructor(data: RecursiveArray<Cell>) {
		this.data = data;
	}

	static fromInitializer(sizes: Array<number>, initializer: (path: Array<number>) => Cell = (path) => undefined): Grid {
		return new (this.constructor as Buildable<any>)(initializeArray(sizes, initializer));
	}

	get dimension(): number {
		let dim = 0;
		let lense: RecursiveArray<any> = this.data;
		while (lense instanceof Array){
			dim += 1;
			lense = lense[0];
		}
		return dim;
	}
	// Accessors for deeply nested arrays
	set(coordinate: Coordinate, value: Cell | RecursiveArray<Cell>): void {
		let front = coordinate.slice(0, -1) as Coordinate;
		let last = coordinate.slice(-1)[0];
		let deepestArray = this.get(front);
		deepestArray[last] = value;
	}
	get(coordinate: Coordinate): Cell | RecursiveArray<Cell> {
		let lense: Cell | RecursiveArray<Cell> = this.data;
		coordinate.forEach((coord) => (lense = lense[coord]));
		return lense;
	}
	delete(coordinate: Coordinate): void {
		let front = coordinate.slice(0, -1) as Coordinate;
		let last = coordinate.slice(-1)[0];
		let deepestArray = this.get(front);
		delete deepestArray[last];
	}
	// Functional
	map(func: (cell: Cell, coordinate: Coordinate, grid: this) => Cell) {

		this.data.map(function(value: Cell | RecursiveArray<Cell>,
							   index: number,
							   array: Array<Cell | RecursiveArray<Cell>>
							   ): Cell | RecursiveArray<Cell> {
			if(Cell.is(value)){

			} else {
				// Recurse
			}

		})
	}
	mapPoint(pointMorphism: (point: Point) => Point): this {

	}
}

function isRecursiveArray<T>(value): value is RecursiveArray<T> {
	return (value.length !== undefined);
}

function recursiveArrayBind<T, U>(
	func: (value: T, index: number, array: RecursiveArray<T>) => U
	): (input: RecursiveArray<T>) => RecursiveArray<U> {
	/*
	... I think this might be the traversal for array
	 */
	function wrapped(array: RecursiveArray<T>): RecursiveArray<U> {
		var self = this;
		return array.map(function(value: T, index: number, array: Array<T>): U {
			if (isRecursiveArray(value)) {
				return self.call(self, value)
			} else {
				return func(value, index, array)
			}
		})
	}
	return wrapped
}




//IPoint<_Cell extends ICell, _Coordinate extends ICoordinate, _Grid extends IGrid<_Cell, _Coordinate>> {
class Point implements IPoint<Cell, Coordinate, Grid<Cell, Coordinate>> {
	/*
	Potential source of bugs: 'coordinate' only indexes 'party-way' into 'grid',
	and so this.grid.get(this.coordinate) returns RecursiveArray<Cell> instead of Cell
	 */
	grid: Grid;
	private _coordinate: Coordinate;
	constructor(grid: Grid, coordinate: Coordinate) {
		this.grid = grid;
		this.coordinate = coordinate;
	}
	get coordinate() {
		return this._coordinate;
	}
	set coordiante(coordinate: Coordinate) {
		assert(this.grid.dimension === coordinate.dimension)
		this._coordinate = coordinate;
	}
	get cell() {
		// Potential Bug: 'coordinate' only indexes 'party-way' into 'grid',
		// and so this.grid.get(this.coordinate) returns RecursiveArray< Cell > instead of Cell
		// Fix: the assert() inside the coordinate setter
		return this.grid.get(this.coordinate) as Cell;
	}
	set cell(cell: Cell) {
		this.grid.set(this.coordinate, cell);
	}
	mapSet(cellFunc: (cell: ICell) => ICell): this {
		let newCell = cellFunc(this.cell);
		let newGrid = this.grid.setCell(this.coordinate, newCell);
		return new this.prototype.constructor(
			newGrid,
			this.coordinate,
			newCell
		);
	}
}


