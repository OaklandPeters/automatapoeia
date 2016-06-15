/**
 * General utility and broadly useful support functions.
 *
 * Underscore.js has better versions of a lot of these functions, but I don't
 * want to introduce that dependency into this file, so it can be portable.
 */

/**
 * Interfaces
 * Broadly useful, and non-project specific
 */
export interface Constructible<T> {
	/*  Constructible & Buildable are utility types, used to appease TypeScript
	when calling this.constructor from methods. */
	new (...args: any[]): T;
};

export type Buildable<T> = Constructible<T> & Function;

export interface RecursiveObject<T> {
	/**
	 * RecursiveArray and RecursiveObject are used to represent arrays
	 * which may be nested - such as the case of higher dimension arrays,
	 * or trees. The 'leaf' values are of type T
	 */
	[i: number]: T | RecursiveArray<T>
}

export interface RecursiveArray<T> extends Array<RecursiveObject<T>> {
}



/**
 * Iteration functions
 * 
 * Some of these are familiar from Python
 * I'm targetting es5, so do not have access to generators.
 * If I had access to generators, these would be written very differently.
 */
export function range(start: number, stop: number, step: number = 1): number[] {
	/* Modified from Underscore's range() function. */
    let length = Math.max(Math.ceil((stop - start) / step), 0);
    let range = Array(length);
    for (let idx = 0; idx <= stop; start += step) {
		range[idx] = start;
    }
    return range;
};

export function enumerate<T>(array: Array<T>) {
	return array.map(function(element, index) {
		return [index, element]
	});
}



export function indices(sized: { length: number }): Array<number> {
	let _indices = Array(sized.length);
	for (let i = 0; i < sized.length; i++) {
		_indices[i] = i
	}
	return _indices;
};

/**
 * Array functions
 *
 * In ES6, most of these would be written more generally - to support iterators.
 */
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
		return Array.apply(null, Array(count)).map((_: any, i: number) => [left[i], right[i]])
	}
	static shortest<L, R>(left: L[], right: R[]): [L, R][] {
		return this.pair<L, R>(left, right, left.length <= right.length ? left.length : right.length)
	}
	static longest<L, R>(left: L[], right: R[]): [L, R][] {
		return this.pair<L, R>(left, right, left.length >= right.length ? left.length : right.length)
	}
}

export function flattenArray<T>(array: RecursiveArray<T>): RecursiveArray<T> {
	return [].concat.apply([], array)
}

export function mergeArrays<T, U>(left: Array<T>, right: Array<U>): Array<T | U> {
	let newArray = left.slice();
	newArray.concat.apply([], right)
	return newArray;
}

export function shove<T>(array: Array<T>, element: T): Array<T> {
	/** Immutable 'push' - copy array, with 'element' appended. */
	let newArray: Array<T> = array.slice();
	newArray.push(element);
	return newArray;
}



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


/**
 * Quality-of-life functions
 */
declare var hasOwnProperty: (obj: any, key: string|number) => boolean;
export function has(obj: any, key: string | number) {
    return obj != null && hasOwnProperty.call(obj, key);
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

export function format(template: string, ...matches: string[], keywords: {[key: string]: string} = {}): string {
	function replacer(match: string, content: string|number) {	//Replace with return value
		/**
		 * Returns a new value to replace the match. This function is used as argument into the String.replace(regex[,rep_func]) function
		 * match: full string '{X}'
		 * content: inside string: 'X'
		 */
		if (typeof content === "number") {
		// if (content % 1 == 0) {	//~if it is an integer (number or string) 
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






/**
 * Unfinished functions
 */
export function arrayEquals(first: Array<any>, second: Array<any>): boolean {
	/**
	 * Compare arrays for equality.
	 * The hard part of this is dispatching on equality functions for the nested
	 * objects.
	 * 
	 * Underscore has a much better function for this: _.isEqual(first, second)
	 */
	if (first.length != second.length) {
		return false;
	}
	Zip.shortest(first, second).every(function([left, right], index): boolean {
		if ((typeof first === 'array') && (typeof second === 'array')) {
			return arrayEquals(first, second)
		} else {
			return (left === right)
		}
	})
}



