import {OrderedActionsInterface, ActionInterface, ActionUIInterface} from './interfaces';
import {PointBase, GridBase} from './grid'


export class AllActionsClass extends Array<ActionInterface> implements OrderedActionsInterface {

}

export var AllActions = new AllActionsClass();

export class Action implements ActionInterface {
	constructor(
		public name: string,
		public actionUI?: ActionUIInterface
	) { }

	register(): void {
		AllActions.push(this);
	}

	step(point: PointBase, grid: GridBase<PointBase>): PointBase {
		/* PLACEHOLDER 
			Since constructing this is actually very complicated, and dependent on how the ActionUI will be structured.
		*/
		return point;
	}
}


export class ActionUI implements ActionUIInterface {
	constructor(
		public action: Action
	) { }
}