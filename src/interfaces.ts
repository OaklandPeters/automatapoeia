
export interface Kind {
	name: string;
	graphId: number;
	register: () => Kind;
}

export interface Agent {
	// Single object occupying a single square.
	location: Location;
	kind: Kind;
}


// Define Range as a 2-tuple of points
// export Range = 

export interface Grid {
	dimensions: Array<Array<Point>>;
	agents: Array<Agent>;
	initialize(kindGen?: randomKindGenerator): Grid;
	step(): Grid;
	html: HTMLScriptElement;  //document.getElementById("Grid");
	container: HTMLScriptElement;
	background: HTMLScriptElement;
	css: CSS;
	getNeighbors(agent: Agent): Array<Agent>;
	updateAgents(): Grid;
	neighborsByKind(agent: Agent, kind: Kind): Array<Agent>;
	getAgent(location: Location): Agent;
}

export interface Action {
	// Conditional updates, evaluated against each locus in the grid
	// Examples: if_neighbor, if_random, move_to, 
	name: string;
	actionUI: ActionUI;
	step(agent: Agent, grid: Grid): Grid;
}

export interface ActionUI {
	// UI for setting action rules
}

export interface Editor {
	createTextArea: () => Editor;
}

export interface Model {

}