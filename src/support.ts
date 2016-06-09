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

export function range(start: number, stop: number, step: number = 1) {
	/* Modified from Underscore's range() function. */
    let length = Math.max(Math.ceil((stop - start) / step), 0);
    let range = Array(length);
    for (let idx = 0; idx < length; idx++ , start += step) {
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

export function zip<LeftInner, RightInner, Left extends Array<LeftInner>, Right extends Array<RightInner>>
	(left: Left, right: Right): Array<[LeftInner, RightInner]> {
	/** Aggregate elements from each of two arrays. */
	return left.map(function(_, index) {
		return [left[index], right[index]] as [LeftInner, RightInner]
	});

}