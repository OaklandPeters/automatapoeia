

export interface KindInterface {
	name: string;
	display: string;
	graphicId: number;
	register: () => void;
}

export interface AllKindsInterface {
	/* Array of all existing Kinds */
	empty(): KindInterface;
	get(name: string): KindInterface;
	[index: number]: KindInterface;
}

export type KindDistP = [number, KindInterface];

export interface DistributionInterface {
	integral(): this;
	[index: number]: KindDistP;
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



export interface GridInterface {

	makePoint(coordinates: number[]): PointInterface;
	getPoint(coordinates: number[]): PointInterface;
	setPoint(coordinates: number[], kind: KindInterface): void;


	initialize(distribution: CumulativeDistribution<KindInterface>): this;
	step(): this;
	updatePoints(): this;
	getNeighbors(point: PointInterface): Array<PointInterface>;

	map(func: (point: PointInterface) => PointInterface): this;

	html: HTMLScriptElement;  //document.getElementById("Grid");
	container: HTMLScriptElement;
	background: HTMLScriptElement;
	css: CSS;
}

export interface ActionInterface {
	// Conditional updates, evaluated against each locus in the grid
	// Examples: if_neighbor, if_random, move_to, 
	name: string;
	actionUI: ActionUIInterface;
	step(point: PointInterface, grid: GridInterface): GridInterface;
}

export interface ActionUIInterface {
	// UI for setting action rules
}

export interface EditorInterface {
	createTextArea: () => EditorInterface;
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



export interface ModelInterface {

}
// Model
//   Controls everything, and contains timer loop
//   Methods: play(), pause(), tick(), 
//   setInterval(Model.tick,1000/30); // 30 FPS, watchu gonna do about it
//   Helper methods: getStateFromID(stateID), removeStateByID(stateID), generateNewID(), generateNewEmoji()
//   Attributes: isPlaying, emojiIndex, emoji[]


export interface GameState {
	/* Collection of class-less game-state variables. Interacts with save-state.
	I haven't determined the role of this yet.
	*/
}

// Save
//    Used to save state, rules, and emoji
//    ... need external dependency for this (firebase?) something for data serialization to file
export interface SaveInterface {
	import(path: string): GameState;
	export(path: string): void;
}

// UI
//     Mouse controls, keyboard controls, 



// Utility type, used to appease TypeScript when calling this.constructor from methods.
type Buildable<T> = { new (...args: any[]): T } & Function;

