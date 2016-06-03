
export interface KindInterface {
	name: string;
	graphId: number;
	register: () => KindInterface;
}

export interface AgentInterface {
	// Single object occupying a single square.
	location: PointInterface;
	kind: KindInterface;
}


export interface PointInterface {
	map(func: (value: number, index?: number, thisValues?: Array<number>) => number): this;
	add(PointInterface: this): this;
	invert(): this;
	subtract(PointInterface: this): this;
	compare(point: this, delta: number): Boolean;
	// Constructors and converters
	fromArray(values: number[]): this;
	fromPoint(point: this): this;
	zero(): this;
	toString(): string;
}

export interface randomKindGenerator {
	(): KindInterface;
}

export interface GridInterface {
	makePoint(values: number[]): PointInterface;
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

export interface ActionInterface {
	// Conditional updates, evaluated against each locus in the grid
	// Examples: if_neighbor, if_random, move_to, 
	name: string;
	actionUI: ActionUIInterface;
	step(agent: AgentInterface, grid: GridInterface): GridInterface;
}

export interface ActionUIInterface {
	// UI for setting action rules
}

export interface EditorInterface {
	createTextArea: () => EditorInterface;
}

export interface ModelInterface {

}
