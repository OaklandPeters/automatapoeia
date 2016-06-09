import {CumulativeDistribution} from './distribution';

/* Placeholder, for when I don't know what will go there, and haven't tried yet.
	Uses 'void', so interacting with that type should always fail. */
export type Placeholder = void;

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

export type Likelyhood<T> = [number, T];

export type KindDistP = Likelyhood<KindInterface>;

export interface DistributionInterface {
	integral(): this;
	[index: number]: KindDistP;
}

export type CoordinatesInterface = Array<number>;

export interface PointInterface {
	mapCoordinates(func: (value: number, index?: number, thisValues?: Array<number>) => number): this;
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


export interface GridInterface<PointClass extends PointInterface> {
	initialize(distribution: CumulativeDistribution<KindInterface>): this;
	step(actions: OrderedActionsInterface): this;
	map(func: (point: PointClass, index?: CoordinatesInterface, thisValues?: this) => PointClass): this;
	// Point interaction methods
	makePoint(coordinates: number[]): PointClass;
	getPoint(coordinates: number[]): PointClass;
	setPoint(coordinates: number[], kind: KindInterface): void;
	getNeighbors(point: PointClass): Array<PointClass>;
	// HTML/CSS methods
	html: HTMLScriptElement;  //document.getElementById("Grid");
	container: HTMLScriptElement;
	background: HTMLScriptElement;
	css: CSS;
}

export interface ActionInterface {
	/**
	 * An expression about a conditional action rule, evaluated against
	 * each point in the grid, during each time-step.
	 * 
	 * Examples: if_neighbor, if_random, move_to,
	 */
	name: string;
	actionUI: ActionUIInterface;
	step(point: PointInterface, grid: GridInterface<PointInterface>): PointInterface;
	register(): void;
}

export interface OrderedActionsInterface {
	/** 
	 * Array of all existing action rules, in an order.
	 * 'allActions' returns actions without an order.
	 */
	[index: number]: ActionInterface;
}

export interface ActionUIInterface {
	/**
	 * User-interface for an expression on a conditional action rule.
	 * If {X} then trigger {Y} on {Z}
	 *
	 * ... I heavily suspect this should be a little domain-specific language.
	 */
	action: ActionInterface;
}

export interface LabelInterface {
	/* Block of non-interactive text inside the dynamic UI */
	text: string;
}

export interface EditorInterface {
	createTextArea(): this;
	createTitle(title: string): this;
	createStateUI(): this;
	createActionsUI(actions: ActionInterface[]): ActionUIInterface;
	createActionUI(action: ActionInterface): this;
	createLabel(text: string): LabelInterface;

	// Posibly, not sure if I need these
	// Or they might possibly be better located under ActionUIInterface
	// Note... these will *not* return 'this' - likely returning a new class TBA
	createLikelyhoodSelector(): this;
	createKindSelector(): this;
	createNumberSelector(): this;
	createDirectionSelector(): this; // Highly speculative. Also, a pain in 3D
	// Action adder would be the button to add a new ActionUI
	createActionAdder(): this;
}



export interface TimeInterface {
	/**
	 * Controls everything, and contains the timer loop.
	 */
	play(): this;
	pause(): this;
	isPlaying: Boolean
	// Interval should be a getter/setter property, which updates:
	// setInterval(this.tick, 1000/this.interval)
	interval: number;
	tick(): this;
	tickCount: number;
	grid: GridInterface;
	allKinds: AllKindsInterface;
	allActions: OrderedActionsInterface;
	gameState: GameStateInterface;

}

export interface ControlsInterface {
	/**
	 * Mouse controls, and keyboard controls.
	 * Not sure how to organize this yet.
	 */
	mouse: Placeholder;
	keyboard: Placeholder;
}

export interface GameStateInterface {
	/**
	 * Collection of class-less game-state variables. Interacts with save-state.
	 * This is what is written to JSON as part of the save/load process.
	 * All state-information should be indexable here.
	 */
	kinds: AllKindsInterface;
	grid: GridInterface;
	time: TimeInterface;
	controls: ControlsInterface;
}

export interface SaveInterface {
	/**
	 * Used to save time-state, grid, rules, and kinds
	 */
	import(path: string): GameStateInterface;
	export(path: string): void;
}


/*  Utility types, used to appease TypeScript when calling this.constructor from methods. */
export interface Constructible<T> {
	new (...args: any[]): T;
};

export type Buildable<T> = Constructible<T> & Function;

