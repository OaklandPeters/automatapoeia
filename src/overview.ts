
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


export class Kind {
	// A kind of agent. Corresponds to a single graphic.
	constructor(
		public name: string,
		public graphicId: number
	) { }
	register = function(){
		Kinds[this.name] = this;
	}
}

export var Kinds: { [prop: string]: Kind } = {};

export var Empty = new Kind("Empty", 0).register();

class Dimensions {
	x: number;
	y: number;
	z: number;
}

class Location {
	x: number;
	y: number;
	z: number;
}

export interface Agent {
	// Single object occupying a single square.
	location: Location;
	kind: Kind;
}

export interface Grid {
	dimensions: Dimensions;
	agents: Array<Agent>;
	initialize(kindGen?: randomKindGenerator): Grid;
	step(): Grid;
	html: HTMLScriptElement;  //document.getElementById("grid");
	container: HTMLScriptElement;
	background: HTMLScriptElement;
	css: CSS;
	getNeighbors(agent): Array<Agent>;
	updateAgents(): Grid;
	neighborsByKind(agent, kind): Array<Agent>;
	getAgent(location: Location): Agent;
}

// Grid
//    Methods: step, updateSize, updateAgents,
//		countNeighbors(agent, stateID),
//      createUI


class KindDistribution {
	[name: string]: number;
}

export interface makeRandomKindGenerator {
	(spec: KindDistribution): randomKindGenerator;
}

export interface randomKindGenerator{
	(seed?: number) : Kind;
}

export interface Editor {
	createTextArea;
}

export interface Model {

}
// Editor
//   createTextArea
//   createTitle
//   createStateUI
//   createStatesUI
//   createActionsUI
//   createActionUI
//   ... example has a bunch of other stuff I don't understand the purpose of yet
//      createProportions, createNumber, createSelector, createStateSelector,
//      createLabel, createActionAdder,


// Model
//   Controls everything, and contains timer loop
//   Methods: play(), pause(), tick(), 
//   setInterval(Model.tick,1000/30); // 30 FPS, watchu gonna do about it
//   Helper methods: getStateFromID(stateID), removeStateByID(stateID), generateNewID(), generateNewEmoji()
//   Attributes: isPlaying, emojiIndex, emoji[]
//


// Save
//    Used to save state, rules, and emoji
//    ... need external dependency for this (firebase?) something for data serialization to file

// UI
//     Mouse controls, keyboard controls, 