/**
 * Randomization and probability distributions.
 * Used for generating initial game board states.
 */
import {Likelyhood} from './interfaces';

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


export class Distribution<T> extends Array<Likelyhood<T>> {
	normalize(): this {
		let total = this.reduce((_sum: number, pair: Likelyhood<T>) => _sum + pair[0], 0);
		let normalized = this.map(pair => [pair[0]/total, pair[1]]);
		return this.constructor.apply({}, normalized);
	}
	integral(): CumulativeDistribution<T> {
		let cumulative = 0;
		let accumulator = new CumulativeDistribution<T>();
		let total = this.reduce((_sum: number, pair: Likelyhood<T>) => _sum + pair[0], 0);
		this.forEach(function(pair: Likelyhood<T>) {
			cumulative = cumulative + pair[0];
			accumulator.push([cumulative / total, pair[1]]);
		});
		return accumulator;
	}
}

export class CumulativeDistribution<T> extends Array<Likelyhood<T>> {
	normalize(): this {
		let total = this.reduce((_sum: number, pair: Likelyhood<T>) => _sum + pair[0], 0);
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

export function uniformDistribution<T>(...values: Array<T>): Distribution<T> {
	/**
	 * Convenience function for constructing uniform probability distributions.
	 */
	let uniformProbability = 1.0 / values.length;
	let pairs: Array<Likelyhood<T>> = values.map((value: T) => [uniformProbability, value] as Likelyhood<T>);
	return new Distribution<T>(...pairs);
}
