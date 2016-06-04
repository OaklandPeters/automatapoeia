import * as _ from "underscore";

import {KindInterface, AllKindsInterface, KindsDictInterface, AgentInterface, AgentDistP, DistributionInterface} from './interfaces';

export interface AllKindsInterface {
	kinds: KindsDictInterface;
	empty: KindInterface | void;
	get(name: string): KindInterface;
	add(kind: KindInterface): this;
	random(distribution?: number[]): KindInterface;
}



export class AllKindsClass implements AllKindsInterface {
	private kinds: KindsDictInterface;

	constructor(kinds: KindsDictInterface = {}) {
		this.kinds = kinds;
	}

	get(name: string): Kind {
		return this.kinds[name];
	}

	empty(): Kind | void {
		return this.kinds['empty'];
	}

	all(): Kind[] {
		return values(this.kinds) as Kind[];
	}

	add(kind: Kind): this {
		this.kinds[kind.name] = kind;
		return this;
	}

	remove(kind: string | Kind) {
		let _kind = (typeof kind === 'string') ? kind : kind.name;
		delete this.kinds[_kind];
	}

	random(distribution: Distribution = makeUniformDistribution(this.kinds), seed : number = 0): Kind {
		return makeRandomKind(this.kinds, distribution, seed);
	}
}

export function makeUniformDistribution(kinds: Array<Kind>) : Distribution {

}
export function makeRandomKind()

export var AllKinds: AllKindsClass = new AllKindsClass();

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






export class Distribution<T> extends Array<[number, T]> {
	normalize(): this {
		let total = this.reduce((_sum: number, pair: [number, T]) => _sum + pair[0], 0);
		let normalized = this.map(pair => [pair[0]/total, pair[1]])
		return Distribution.apply({}, normalized);
	}
	integral(): CumulativeDistribution<T> {
		let cumulative = 0;
		let accumulator = new CumulativeDistribution();
		this.forEach(function(pair) {
			cumulative = cumulative + pair[0];
			accumulator.push([cumulative / total, pair[1]);
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
	random(seed: number = 0 ) {

	}
}


export class AgentDistribution extends Array<AgentDistP> {
	integral(): CumulativeAgentDistribution {

		let total = this.reduce((_sum: number, pair: AgentDistP) => _sum + pair[0], 0);


		let cumulative = 0;
		let accumulator = new AgentCumulativeDistribution();
		this.forEach(function(pair: AgentDistP) {
			cumulative = cumulative + pair[0];
			accumulator.push([cumulative / total, pair[1]);
		});
		return accumulator;
	}
}

export class CumulativeAgentDistribution extends Array<AgentDistP> {
	random(seed: number = 0) {

	}
}


/*
Quality of life utilties, should probably go into a different module
*/

function* values(obj): any {
	/* Retreive values with a generator expression */
	for (let key of Object.keys(obj)) {
		yield [key, obj[key]];
	}
}

function construct<T extends Function>(self: T, args: Array<any>): T {
	/* Call constructor from inside class methods. Basic reflection. */
	return self.apply(self, args);
}