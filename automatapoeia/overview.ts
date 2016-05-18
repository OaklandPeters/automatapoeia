
interface Action {
	// Conditional updates, evaluated against each locus in the grid
	// Examples: if_neighbor, if_random, move_to, 
	name: string;
	actionUI: ActionUI;
	step(agent: Agent, grid: Grid): Grid;
}

interface ActionUI {
	// UI for setting action rules
}

interface Agent {
	x: number;
	y: number;
	kind: Kind;
}

class Kind {
	// A kind of agent. Corresponds to a single graphic.
	constructor(public name: string, public graphicId: number) {
	}
}

interface Grid {
	dimensionX: number;
	dimensionY: number;
	agents: Array<Agent>;
	initialize(kindGen?: randomKind): Grid;
}

interface randomKind{
	(seed?: number): Kind;
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

// Grid
//    Methods: initialize, reinitialize, step, updateSize, updateAgents,
//		getNeighbors(agent), getAllAgents(), countNeighbors(agent, stateID),
//      createUI
//    Attributes: dom, domContainer, bg, css, tileSize,

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