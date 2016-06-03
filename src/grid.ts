import {PointInterface, GridInterface, AgentInterface, KindInterface} from './interfaces';


/**
 * Point class hierarchy is unnecessarily complex,
 * as an exercise in learning TypeScript/ES6 classes
 *
 * Improvements:
 * [] Reflect to access constructor. 'npm install babel-polyfill --save'
 *    Allows: Reflect.construct(MyPoint: Point, coordinates: number[])
 *    http://babeljs.io/docs/usage/polyfill/
 */


export abstract class PointBase implements PointInterface {
	/**
	 * Base class shared by all point implementations.
	 * Concrete point classes vary by their dimensionality.
	 */
	coordinates: Array<number>;
	constructor(coordinates: Array<number>, agent?: AgentInterface) {
		this.coordinates = coordinates;
		this.agent = _default(agent, Kinds.default())
		if (agent === undefined) {

		}
	};

	abstract fromArray(coordinates: number[]): this;
	abstract zero(): this;

	fromPoint(point: this): this {
		return this.fromArray(this.coordinates);
	}

	toString(): string {
		// I don't know if this is a valid expression inside a template or not...
		//   ... so for now, it's getting a local variable...
		let inner = this.coordinates.join(", ");
		return "[${inner}]";
	}

	map(func: (value: number, index: number, thisValues: Array<number>) => number): this {
		return this.fromArray(
			this.coordinates.map(
				(val: number, ind: number, array: number[]) => func(val, ind, this.coordinates)
			)
		);
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
 */
export class Point2D extends PointBase {
	fromArray(coordinates: number[]): this {
		return new Point2D(coordinates) as this;
	}
	zero(): this {
		return new Point2D([0, 0]) as this;
	}
}

export class Point3D extends Point2D {
	fromArray(coordinates: number[]): this {
		return new Point3D(coordinates) as this;
	}
	zero(): this {
		return new Point3D([0, 0, 0]) as this;
	}
}





export interface GridInterface {
	makePoint(coordinates: number[]): PointInterface;
	// Agents is an array of arbitary dimensionality, holding objects of type AgentInterface
	// This is impossible to define in any language without recursive types (so... Haskell and OCaml)
	agents: Array<any>;
	getAgent(coordinates: number[]): AgentInterface;
	setAgent(coordinates: number[], agent: AgentInterface): void;

	initialize(kindGen?: randomKindGenerator): this;
	step(): this;
	html: HTMLScriptElement;  //document.getElementById("Grid");
	container: HTMLScriptElement;
	background: HTMLScriptElement;
	css: CSS;
	getNeighbors(agent: AgentInterface): Array<AgentInterface>;
	updateAgents(): this;
	neighborsByKind(agent: AgentInterface, kind: KindInterface): Array<AgentInterface>;
	getAgent(location: Location): AgentInterface;
}

export abstract class GridBase<GPoint> implements GridInterface {
	abstract makePoint(coordinates: number[]): GPoint;
	abstract map(func: (agent: AgentInterface) => AgentInterface): this;
	
	set(): this {

	}
}