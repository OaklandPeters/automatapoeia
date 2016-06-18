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
import {RecursiveArray, RecursiveObject} from './support';
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


	setCell(coordinates: _Coordinate): this;
	getPoint(coordinate: _Coordinate): IPoint<_Cell, _Coordinate, this>;
	getLocus(coordinates: Array<_Coordinate>): ILocus<_Cell, _Coordinate, this, IPoint<_Cell, _Coordinate, this>>;

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
}

class Grid implements IGrid<Cell, Coordinate> {
	constructor(
		public data: RecursiveArray<Cell>
	) { }
	get dimension(): number {
		let dim = 0;
		let lense: RecursiveArray<any> = this.data;
		while (lense instanceof Array){
			dim += 1;
			lense = lense[0];
		}
		return dim;
	}
}



class Point implements IPoint<Placeholder, Placeholder, Placeholder> {
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


