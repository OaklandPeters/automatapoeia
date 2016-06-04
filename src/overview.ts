import * as _ from "underscore";



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