import * as _ from "underscore";



export interface Kind {
	name: string;
	graphId: number;
	register: () => Kind;
}

var Kinds = new Array();
Kinds.register = function (kind: Kind) {
	this.push(kind);
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