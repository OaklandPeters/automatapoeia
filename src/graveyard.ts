export interface GridLensInterface {
	push(point: PointInterface): void;
	pop(): PointInterface;
	nearby(distance:number): this
	filter(predicate: (point: PointInterface) => Boolean): this;
}

export class GridLensBase<GridClass extends GridBase<PointClass>, PointClass extends PointBase> implements GridLensInterface {
	constructor(
		protected grid: GridClass,
		protected focus: PointClass,
		protected points: PointClass[]
	) {	}
	push(point: PointClass) {
		this.points.push(point);
	}
	pop(): PointClass {
		return this.points.pop();
	}
	nearby(distance: number = 1): this {
		// this will be some combinatorics, to handle it for arbitary dimension
		// So.... hard
		let accumulator: PointClass[] = [];

		// Dimensions of focus   X   range(dimension - distance, dimension + distance)
		// Use two utility generator functions: range(min, max), combinations(...elements)
		this.focus.coordinates.forEach(function (coordinate, index) {
			// Make range
		});

		return this.constructor(
			this.grid, this.focus, accumulator
		)
	}
	filter(predicate: (point: PointInterface) => Boolean): this {

	}
}