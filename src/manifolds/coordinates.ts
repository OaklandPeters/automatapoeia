import {ICoordinate, IManifold, ISubManifold} from './interfaces';

export class Coordinate extends Array<number> implements ICoordinate {
	/*
	An array of numbers indexing into a specific manifold.
	LeafCoordinate and StemCoordinate are used to aid type-checking, by
	deterening what manifold.get(coorindate) might return

	Coordinates are most easily constructed off of a manifold.
		manifold = new Manifold(...)
		c1 = manifold.coordinate([1, 2, 3])


	
	@todo: simplification - give manifold a default value to a Null or Universal manifold.
		So that this default makes Coordinate behave like non-rooted array of numbers.
	@todo: IF coordinate is constructed with values = another coordinate,
		then it should convert values to a simple array
	 */
	manifold: IManifold<ICoordinate, any>;
	constructor(
		values: Array<number>,
		manifold: IManifold<ICoordinate, any>
	) {
		// This step should convert the Coordinate toArray
		// ... not sure how to do this ATM
		// if (Coordinate.is(values)) {
		// 	values = 
		// }
		super(...values);
		this.manifold = manifold;
	}

	get dimension() {
		return this.length;
	}

	static is(value: any): value is Coordinate {
		if ((value.dimension !== undefined)
			&& (value.manifold !== undefined)) {
			return true

		}
		return false
	}

	static isInManifold(value: any, manifold: IManifold<ICoordinate, any>): value is Coordinate {
		if (Coordinate.is(value)) {
			return ((value.manifold === manifold)
				    && (value.manifold.dimension >= value.dimension))
		}
		return false
	}

	static assertInManifold(value: any, manifold: IManifold<ICoordinate, any>): Coordinate {
		if (Coordinate.isInManifold(value, manifold)){
			return value
		}
		throw `coordinate of length ${value.dimension} is too large to index into manifold of length ${value.dimension}`;
	}

	append(items: Array<number>): this {
		/* Array.concat, but that function has problems with the return type
		being always 'Array'.
		*/
		return super.concat(items) as any as this
	}

	adopt(manifold: IManifold<ICoordinate, any>): Coordinate {
		return new Coordinate(new Array(...this), manifold);
	}
}

export class LeafCoordinate extends Coordinate {
	constructor(
		values: Array<number>,
		manifold: IManifold<ICoordinate, any>
	) {
		LeafCoordinate.assert({dimension: values.length, manifold: manifold})
		super(values, manifold);
	}

	static is(coordinate: any): coordinate is LeafCoordinate {
		if (Coordinate.is(coordinate)) {
			return (coordinate.manifold.dimension === coordinate.dimension)
		}
		return false
	}
	static assert(value: {dimension: number, manifold: IManifold<ICoordinate, any>}): LeafCoordinate {
		if (LeafCoordinate.is(value)) {
			return value
		} else {
			throw `To access a leaf node, a coordinate of length ${value.dimension} must exactly match the manifold dimension of ${value.manifold.dimension}`;
		}		
	}

}

export class StemCoordinate extends Coordinate {
	constructor(
		values: Array<number>,
		manifold: IManifold<ICoordinate, any>
	) {
		StemCoordinate.assert({dimension: values.length, manifold: manifold});
		super(values, manifold);
	}
	static is(value: any): value is StemCoordinate {
		if (Coordinate.is(value)) {
			return (value.manifold.dimension > value.dimension);
		}
		return false
	}
	static assert(value: {dimension: number, manifold: IManifold<ICoordinate, any>}): StemCoordinate {
		if (StemCoordinate.is(value)) {
			return value
		} else {
			throw `To access a stem node, a coordinate of length ${value.dimension} must be less than the manifold dimension of ${value.manifold.dimension}`;
		}		
	}
}
