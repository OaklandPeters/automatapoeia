function shove(array, element) {
	/** Immutable 'push' - copy array, with 'element' appended. */
	let newArray = array.slice();
	newArray.push(element);
	return newArray;
}


function initializeArray(sizes, initializer=(path) => undefined, path = []) {
	/*
	Initialize a high-dimensional array
	 */
	let accumulator = [];
	if (sizes.length === 0) {
		return initializer(path);
	} else {
		// sizes.length >= 2
		let front = sizes[0];
		let rest = sizes.slice(1);
		for (let i = 0; i < front; i+=1) {
			accumulator.push(
				initializeArray(rest, initializer, shove(path, i))
			)
		}
		return accumulator;
	}
}
