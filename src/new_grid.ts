/**
 *
 *
 * Coordinates : array of numbers, without context to which grid they are located in
 *
 * Cell : Coordinates + some data to be associated with it (a kind)
 *
 * Grid : collection of cells located next to one another, which allows to cells to
 * 		have proximity relationships to one another.
 * 		Mappable & traversable
 *
 * Point : a cell + a reference to it's location and the grid it's located in.
 * 		A type of lense into a cell of a grid.
 *
 * Locus : 1 or more points in a container, with a reference to underlying grid. 
 * 		Ignorent of the dimensionality of points.
 * 		Mappable & traversable container. Mutates the grid.
 * 		
 *
 * Open Questions:
 *  How to specify and encode the dimensionality.
 *  This touches on the coordinates (and can be affixed in the constructor)
 *  It also relates to the sizing of the grid, but I'm not sure how to handle that.
 */
import {KindInterface} from './interfaces';
import {Kind, AllKinds} from './agents';
// Quality of life support functions
import {assert, Buildable} from './support';
// Recursive & advanced array functions
import {RecursiveArray, RecursiveObject, isRecursiveArray, traverseArray, enumerateArray, initializeArray} from './support';
import {IManifold, Manifold} from './manifold';


type Placeholder = any;

interface ICoordinate extends Array<number> {
	dimension: number;
}

interface ICell {
	data: any;
}

interface IGrid<_Cell extends ICell, _Coordinate extends ICoordinate> {
	cells: RecursiveArray<_Cell>;
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

	// new(grid: _Grid, coordinate: _Coordinate, cell: _Cell): this;


	// Needs: map cell, and update grid with it
	// 		map cell, returning a new point
	// 		map cell, changing this one, but not updating the grid
	// setCell(cellFunc: (cell: _Cell) => _Cell): this;
	// update(): _Grid;
	
}


interface ILocus<_Cell extends ICell, _Coordinate extends ICoordinate, _Grid extends IGrid<_Cell, _Coordinate>, _Point extends IPoint<_Cell, _Coordinate, _Grid>> {
	grid: _Grid;
	points: Array<_Point>;
}






//
//	Implementations
//


export class Cell implements ICell {
	constructor(
		public kind: KindInterface
	) { }
	get data() {
		return this.kind;
	}
	set data(value: KindInterface) {
		this.kind = value;
	}
	static is(value: any): value is Cell {
		/*
		Runtime type matching for Cell. Used to determine the bottom of recursive descent in Grids.
		 */
		return (value.kind !== undefined)
	}
}

class Coordinate extends Array<number> {
	get dimension() {
		return this.length;
	}
}



export class Grid<Coordinate extends ICoordinate, _Cell extends ICell> implements IGrid<_Cell, Coordinate> {
	/**
	 *
	 * @Todo: change this to extend Manifold<_Cell>
	 */
	cells: RecursiveArray<_Cell>;

	constructor(cells: RecursiveArray<_Cell>) {
		this.cells = cells;
	}

	static is<_Coordinate extends ICoordinate, _Cell>(value: any): value is Grid<_Coordinate, _Cell> {
		// This function needs to be improved. It's too loose atm
		return ((value.cells !== undefined))
	}

	static fromInitializer<Coordinate extends ICoordinate, Cell extends ICell>(
		sizes: Array<number>,
		initializer: (path: Array<number>) => Cell
	): Grid<Coordinate, Cell> {
		return new Grid<Coordinate, Cell>(initializeArray(sizes, initializer) as RecursiveArray<Cell>);
	}

	get dimension(): number {
		let dim = 0;
		let lense: RecursiveArray<any> = this.cells;
		while (lense instanceof Array){
			dim += 1;
			lense = lense[0];
		}
		return dim;
	}

	// Accessors for deeply nested arrays
	set(coordinate: Coordinate, value: _Cell | RecursiveArray<_Cell>): void {
		let front = coordinate.slice(0, -1) as Coordinate;
		let last = coordinate.slice(-1)[0];
		let deepestArray = this.get(front) as RecursiveArray<_Cell>;
		deepestArray[last] = value;
	}
	get(coordinate: Coordinate): _Cell | RecursiveArray<_Cell> {
		return coordinate.reduce<_Cell | RecursiveArray<_Cell>>(
			(lense, coord) => isRecursiveArray<_Cell>(lense) ?
				lense[coord] :
				lense,
			this.cells as _Cell | RecursiveArray<_Cell>
		)
	}
	delete(coordinate: Coordinate): void {
		let front = coordinate.slice(0, -1) as Coordinate;
		let last = coordinate.slice(-1)[0];
		let deepestArray = this.get(front);
		if (isRecursiveArray(deepestArray)){
			delete deepestArray[last];
		} else {
			throw `Error during recursive descent with coordinates ${coordinate}`;
		}
	}




	// Functional
	// map<U>(func: (cell: _Cell, coordinate: Coordinate, grid: this) => U) {
	// 	this.cells.map(function(value: _Cell | RecursiveArray<_Cell>,
	// 						   index: number,
	// 						   array: Array<_Cell | RecursiveArray<_Cell>>
	// 						   ): _Cell | RecursiveArray<_Cell> {
	// 		if(Cell.is(value)){

	// 		} else {
	// 			// Recurse
	// 		}
	// 	})
	// }
	// mapPoint(pointMorphism: (point: Point) => Point): this {
	// }
}






//IPoint<_Cell extends ICell, _Coordinate extends ICoordinate, _Grid extends IGrid<_Cell, _Coordinate>> {
export class Point implements IPoint<Cell, Coordinate, Grid<Coordinate, Cell>> {
	/*
	Potential source of bugs: 'coordinate' only indexes 'party-way' into 'grid',
	and so this.grid.get(this.coordinate) returns RecursiveArray<Cell> instead of Cell
	 */
	grid: Grid<Coordinate, Cell>;
	private _coordinate: Coordinate;
	constructor(grid: Grid<Coordinate, Cell>, coordinate: Coordinate) {
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
		let newGrid = this.grid.set(this.coordinate, newCell as any as Cell | RecursiveArray<Cell>);
		return new (this.constructor as Buildable<this>)(
			newGrid,
			this.coordinate,
			newCell
		);
	}
}
