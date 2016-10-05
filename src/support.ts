/**
 * General utility and broadly useful support functions.
 *
 * Underscore.js has better versions of a lot of these functions, but I don't
 * want to introduce that dependency into this file, so it can be portable.
 */





/**
 * Type-Utility
 * -----------------
 * TypeScript specific utility interfaces and checking-functions
 * Broadly useful, and non-project specific
 */
export interface Constructible<T> {
	/*  Constructible & Buildable are utility types, used to appease TypeScript
	when calling this.constructor from methods. */
	new (...args: any[]): T;
};

export type Buildable<T> = Constructible<T> & Function;

export interface RecursiveObject<T> extends Array<T | RecursiveArray<T>>{
	/**
	 * RecursiveArray and RecursiveObject are used to represent arrays
	 * which may be nested - such as the case of higher dimension arrays,
	 * or trees. The 'leaf' values are of type T
	 */
	// [i: number]: T | RecursiveArray<T>
}

export interface RecursiveArray<T> extends RecursiveObject<T> {
}

export function isArray<T>(value: any): value is Array<T> {
	/*
	@todo: Have this use type_check.ts utility functions:
	return StructuralCheck(value, {
		length: Number, map: Function, forEach: Function,
		reduce: Function
	})
	 */
	return (value.length !== undefined);
}

/* Placeholder, for when I don't know what will go there, and haven't tried yet.
	Uses 'void', so interacting with that type should always fail. */
export type Placeholder = void;


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


export function flattenArray<T>(nested: Array<Array<T>>): Array<T> {
	return nested.reduce((accumulator, array) => accumulator.concat(array), [])
}

export function mergeArrays<T, U>(left: Array<T>, right: Array<U>): Array<T | U> {
	let newArray = left.slice();
	return newArray.concat.apply([], right);
}

export function shove<T>(array: Array<T>, element: T): Array<T> {
	/** Immutable 'push' - copy array, with 'element' appended. */
	let newArray: Array<T> = array.slice();
	newArray.push(element);
	return newArray;
}

export function initializeArray<T>(
		sizes: Array<number>,
		initializer: (path: Array<number>) => T = ((path) => undefined),
		path: Array<number> = []): T | RecursiveArray<T> {
	/*
	Initialize a high-dimensional array, with values returned by initializer function.
	If sizes is an empty array, returns a 'point' - a value from the initializer function
	with no wrapping array.
	 */
	if (sizes.length === 0) {
		return initializer(path);
	} else {
		// sizes.length >= 2
		let accumulator: RecursiveArray<T> = [];
		accumulator as RecursiveArray<T>;
		let front = sizes[0];
		let rest = sizes.slice(1);
		for (let i = 0; i < front; i += 1) {
			accumulator.push(
				initializeArray(rest, initializer, shove(path, i))
			)
		}
		return accumulator;	
	}
}

export function isRecursiveArray<T>(value: any): value is RecursiveArray<T> {
	return (value.length !== undefined);
}

export function isMappable(value: any): value is {map: Function} {
	return (value.map !== undefined)
}

export function recursiveMap<T, U>(func: (value: T) => U, guard = isMappable): (input: RecursiveArray<T> | T) => RecursiveArray<U> | U {
	/* Recursive version of array.map. */
	function wrapper(value: RecursiveArray<T> | T): RecursiveArray<U> | U {
		if (guard(value)) {
			return value.map(function(elm: RecursiveArray<T> | T, index: number, array: RecursiveArray<T>) {
				return wrapper(elm)
			})
		} else {
			return func(value)
		}
	}
	return wrapper
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
 * String Manipulation Functions
 */
export function format(template: string, matches: string[], keywords: {[key: string]: string} = {}): string {
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

export function objectString(obj: any, keys: Array<string>): string {
	/* 
	@todo: Move this into support.ts
	*/
	let fieldsToDisplay = keys
		.filter((key: string) => ((obj as any)[key] !== undefined))
		.map((key) => (key + ": '" + String((obj as any)[key]) + "'"))
		.join(", ");
	return "{" + fieldsToDisplay + "}";
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

export function assertType<T>(value: any, checker: (x: any) => boolean): value is T {
	return checker(value)
}

export function construct<T extends Function>(self: T, args: Array<any>): T {
	/* Call constructor from inside class methods. Basic reflection. */
	return self.apply(self, args);
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
};


export function traverseArray<T, U>(
	f: (elm: T, path: Array<number>, thisArray: RecursiveArray<T>) => RecursiveArray<U>,
	locus: RecursiveArray<T>,
	path: Array<number> = []
	): RecursiveArray<U> {
	/*
	Map across a potentially nested array, while preserving the array structure.
	For example:

	var nested = [[1, 2], [3, 4], [5], 6, [[7, 8]]]
	traverseArray((x) => [x-2, x+2], nested)
	[[-1, 3, 0, 4], [1, 5, 2, 6], [3, 7], 4, 8, [[5, 9, 6, 10]]]


	@todo: See if I can make a version of this with a stricter 'f': (elm: T) => U
		and then derive this version from that. IE
		make_paths = (array) => traverse(...something to add a path...., array)
	 */
	return locus.reduce(
		function(accumulator: RecursiveArray<U>, elm: T|RecursiveArray<T>, index: number, innerThisArray: RecursiveArray<T>): RecursiveArray<U> {
			let new_path = path.slice().concat([index])
			if (isArray(elm)){
				return accumulator.concat([
					traverseArray(f, elm, new_path)
				])
			} else {
				return accumulator.concat(f(elm, new_path, innerThisArray))
			}
		}
	, [] as RecursiveArray<U>
	)
}

export function enumerateArray<T>(value: RecursiveArray<T>, path: Array<number> = []): RecursiveArray<[Array<number>, T]>{
	/*
	Return 1-D array of [path, element] pairs for a potentially nested array.
	'arrayEnumerate' derives this from 'traverseArray'.
	 */
	let accumulator: Array<[Array<number>, T]> = [];
	traverseArray<T, T>(
		function(elm: T, path: Array<number>): RecursiveArray<T> {
			accumulator.push([path, elm]);
			return [elm] as RecursiveArray<T>
		},
		value
	)
	return accumulator
}

export function recursiveArrayEnumerate<T>(value: T | RecursiveArray<T>, path: Array<number> = []): RecursiveArray<[Array<number>, T]>{
	/*
	Return 1-D array of [path, element] pairs for a potentially nested array.
	Unlike 'arrayEnumerate', this does not depend on an explicit traversal function.
	 */
	let results: RecursiveArray<[Array<number>, T]> = [];
	if (isRecursiveArray(value)) {
		value.forEach(function (element: T|RecursiveArray<T>, index: number): void {
			let new_path = path.slice().concat([index])
			let subresults = recursiveArrayEnumerate(element, new_path);
			results = results.concat(subresults)
		});
		return results;
	} else {
		return [[path, value]]
	}
}

export function arrayConcat<T, U>(left: Array<T>, right: Array<U>): Array<T | U> {
	/* This is not needed, but Array.concat() already exists. */
	let accumulator = new Array<T | U>();
	left.forEach((elm: T) => accumulator.push(elm));
	right.forEach((elm: U) => accumulator.push(elm));
	return accumulator;
}

