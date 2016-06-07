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
		AllKinds.add(this);
	}
}

export var EmptyKind = new Kind('Empty', 0).register();






export class Distribution<T> extends Array<[number, T]> {
	normalize(): this {
		let total = this.reduce((_sum: number, pair: [number, T]) => _sum + pair[0], 0);
		let normalized = this.map(pair => [pair[0]/total, pair[1]]);
		//
		return this.constructor.apply({}, normalized);
		// return Distribution.apply({}, normalized);
	}
	integral(): CumulativeDistribution<T> {
		let cumulative = 0;
		let accumulator = new CumulativeDistribution<T>();
		let total = this.reduce((_sum: number, pair: [number, T]) => _sum + pair[0], 0);
		this.forEach(function(pair: [number, T]) {
			cumulative = cumulative + pair[0];
			accumulator.push([cumulative / total, pair[1]]);
		});
		return accumulator;
	}
}

export class CumulativeDistribution<T> extends Array<[number, T]> {
	normalize(): this {
		let total = this.reduce((_sum: number, pair: [number, T]) => _sum + pair[0], 0);
		let normalized = this.map(pair => [pair[0] / total, pair[1]]);
		return this.constructor.apply({}, normalized);
	}
	random(seed: number = 0 ): T {
		let rando = random.unit();
		this.forEach(function(pair) {
			if (rando <= pair[0]) {
				return pair[1] as T;
			}
		});
		throw Error("Incorrectly constructred CumulativeDistribution - no entry matched random number: " + String(rando));
	}
}


// export class AgentDistribution extends Array<KindDistP> {
// 	integral(): CumulativeAgentDistribution {

// 		let total = this.reduce((_sum: number, pair: KindDistP) => _sum + pair[0], 0);


// 		let cumulative = 0;
// 		let accumulator = new AgentCumulativeDistribution();
// 		this.forEach(function(pair: KindDistP) {
// 			cumulative = cumulative + pair[0];
// 			accumulator.push([cumulative / total, pair[1]);
// 		});
// 		return accumulator;
// 	}
// }

// export class CumulativeAgentDistribution extends Array<KindDistP> {
// 	random(seed: number = 0) {

// 	}
// }


/*
Quality of life utilties, should probably go into a different module
*/

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

export class Random {
	/*
	Short-term hack. I need to install a better library for this.
	*/
	constructor(public seed: number = 0) { }
	foldSeed(seed: number): number {
		return (seed * 9301 + 49297) % 233280;
	}
	range(seed: number = this.seed, min = 0, max = 1) {
		this.seed = this.foldSeed(seed);
		let rando = this.seed / 233280;
		return min + rando * (max - min);
	}
	unit(seed: number = this.seed) {
		return this.range(seed);
	}
}
export var random: Random = new Random(0);
