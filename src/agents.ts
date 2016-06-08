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





function* values(obj: any): any {
	/* Retreive values with a generator expression */
	for (let key of Object.keys(obj)) {
		yield [key, obj[key]];
	}
}

function construct<T extends Function>(self: T, args: Array<any>): T {
	/* Call constructor from inside class methods. Basic reflection. */
	return self.apply(self, args);
}

