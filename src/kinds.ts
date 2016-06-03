import {KindInterface, AllKindsInterface} from './interfaces';

type KindsDict = { [name: string]: Kind };

export class AllKindsClass implements AllKindsInterface {
	kinds: KindsDict;

	constructor(kinds?: KindsDict) {
		this.kinds = kinds || {};
	}

	emptyKind(): Kind {
		return this.kinds['empty'];
	}

	add(kind: Kind): this {
		this.kinds[kind.name] = kind;
		return this;
	}

	remove(kind: string | Kind) {
		let _kind = (typeof kind === 'string') ? kind : kind.name;
		delete this.kinds[_kind];
	}

	random(distribution?: number[]): Kind {

	}
}

var AllKinds: AllKindsClass = new AllKindsClass();

export class Kind implements KindInterface {
	// A kind of agent. Corresponds to a single graphic.
	name: string;

	constructor(
		public display: string,
		public graphicId: number,
		name?: string
	) { 
		this.name = name || display.toLowerCase();
	}

	register(): void {
		AllKinds.add(this);
	}
}

export var EmptyKind = new Kind('Empty', 0).register();