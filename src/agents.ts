import * as _ from "underscore";

import {KindInterface, AllKindsInterface, KindDistP, DistributionInterface} from './interfaces';


export class AllKindsClass extends Array<Kind> implements AllKindsInterface {
	get(name: string): Kind {
		return this.find((kind) => kind.name == name)
	}
	empty(): Kind {
		return this.get('empty');
	}

}

export var AllKinds: AllKindsClass = new AllKindsClass();

export class Kind implements KindInterface {
	/* A kind of agent. Corresponds to a single graphic. */

	constructor(
		public display: string,
		public graphicId: number,
		public name: string = display.toLowerCase()
	) { }

	register(): void {
		AllKinds.push(this);
	}
}

export var EmptyKind = new Kind('Empty', 0).register();
