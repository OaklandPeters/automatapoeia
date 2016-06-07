/**
 * High-dimensional array-like structure.
 */

export class Tensor<T> {
	constructor(public dimensions: number[]) {

	}

	static empty(dimensions: number[]) {

	}

	initialize(values: Array<any>) {
		// values lengths must match dimensions	
	}

}

function makeTensor<T>(_constructor: Function, dimensions: number[]): Tensor<T> {
	return _constructor(dimensions) as Tensor<T>;
}

function range(min: number, max: number, step: number = 1): number[] { 
	let accumulator: number[] = [];
	for (let i = min; i <= max; i=i+step) {
		accumulator.push(i);
	}
	return accumulator;
}
