export function product<T>(...pools: Array<Array<T>>): Array<Array<T>> {
	/**
	 * Cartesian product of arrays.
	 * product(['A', 'B', 'C', 'D'], ['x', 'y']) --> [['A', 'x'], ['A', 'y'], ['B', 'x'], ...]
	 */
	let accumulator: Array<Array<T>> = [[]];
	pools.forEach(function(pool) {
		var temp: Array<Array<T>> = [];
		accumulator.forEach(function(prior) {
			pool.forEach(function(entry) {
				let _t = prior.slice();
				_t.push(entry)
				temp.push(_t)
			});
		})
		accumulator = temp;
	})
	return accumulator;
};

export function range(start: number, stop: number, step: number = 1): number[] {
	/* Modified from Underscore's range() function. */
    let length = Math.max(Math.ceil((stop - start) / step), 0);
    let range = Array(length);
    for (let idx = 0; idx <= stop; start += step) {
		range[idx] = start;
    }
    return range;
};

export function assert(value: Boolean, message: string = "Invalid assertion.") {
	if (!value) {
		throw Error(message)
	}
};

export function construct<T extends Function>(self: T, args: Array<any>): T {
	/* Call constructor from inside class methods. Basic reflection. */
	return self.apply(self, args);
};

export function indices(sized: {length: number}): Array<number> {
	let _indices = Array(sized.length);
	for (let i = 0; i < sized.length; i++) {
		_indices[i] = i
	}
	return _indices;
};

export class Zip {
	/**
	 * Aggregate elements from each of two arrays.
	 * This function is kept binary, because TypeScript can't handle type information for arrays of generics
	 * (until version 2.0 - according to its roadmap).
	 * 
	 * Zip.shortest(['a', 'b'], ['c', 'd', 'e']) == [['a', 'c'], ['b', 'd']]
	 * Zip.longest(['a', 'b'], ['c', 'd', 'e']) == [['a', 'c'], ['b', 'd'], [undefined, 'e']]
	 */
	private static pair<L, R>(left: L[], right: R[], count: number): [L, R][] {
		return Array.apply(null, Array(count)).map((_, i) => [left[i], right[i]])
	}
	static shortest<L, R>(left: L[], right: R[]): [L, R][] {
		return this.pair<L, R>(left, right, left.length <= right.length ? left.length : right.length)
	}
	static longest<L, R>(left: L[], right: R[]): [L, R][] {
		return this.pair<L, R>(left, right, left.length >= right.length ? left.length : right.length)
	}
}

export function enumerate<T>(array: Array<T>) {
	return array.map(function(element, index) {
		return [index, element]
	});
}

export function format(template: string, ...matches: string[], keywords: {[key: string]: string} = {}): string {
	function replacer(match, content) {	//Replace with return value
		/**
		 * Returns a new value to replace the match. This function is used as argument into the String.replace(regex[,rep_func]) function
		 * match: full string '{X}'
		 * content: inside string: 'X'
		 */

		if (content % 1 == 0) {	//~if it is an integer (number or string) 
			return matches[content];
		} else {
			if (content in keywords) { //If the last argument has property named by content, even if that property is inherited.
				if (keywords[content] == undefined) {	//Do not throw an error
					return "-";							//But replace with nullstring/NA type of symbol
				} else {
					return keywords[content];	//Replace with the property of last_arg
				}
			} else {
				return match;	//Make no change
			}
		}
	}
	return template.replace(/{(.*?)}/g, replacer);
};

export function arrayEquals<T>(first: Array<T>, second: Array<T>): Boolean {
	if (first.length != second.length) {
		return false;
	}
	zip(first, second) 
	return true;
}



/*  Utility types, used to appease TypeScript when calling this.constructor from methods. */
export interface Constructible<T> {
	new (...args: any[]): T;
};

export type Buildable<T> = Constructible<T> & Function;







export interface RecursiveObject<T> {
	[i: number]: T | RecursiveArray<T>
}
export interface RecursiveArray<T> extends Array<RecursiveObject<T>> {
}

export function flattenArray<T>(array: RecursiveArray<T>): RecursiveArray<T> {
	return [].concat.apply([], array)
}

export function mergeArrays<T, U>(left: Array<T>, right: Array<U>): Array<T | U> {
	let newArray = left.slice();
	newArray.concat.apply([], right)
}

export function shove<T>(array: Array<T>, element: T): Array<T> {
	// Copy array, with element appended
	let newArray: Array<T> = array.slice();
	newArray.push(element);
	return newArray;
}
