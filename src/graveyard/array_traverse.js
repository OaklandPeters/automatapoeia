function isArray(value) {
	return (value instanceof Array)
}

function append(left, right) {
	return left.slice().concat(right)
}

function join(array) {
	return array.reduce(function(accumulator, next){
		if (isArray(next)) {
			return append(accumulator, next)
		} else {
			return append(accumulator, [next])
		}
	}, [])
}

function traverse(array, f) {
	// console.log(array, f)
	function _traverseFolder(accumulator, second) {
		let applied = isArray(second) ? [traverse(second, f)] : f(second);
		return append(accumulator, applied);
	}
	if (array.length === 0) {
		return array
	} else {
		// return join(array.reduce(_traverseFolder, []))
		return array.reduce(_traverseFolder, [])
	}
}

function addTwo(x) { return [x - 1, x + 1]}
var arr = [1, 2, 3, [4, 5]]
var result = traverse(arr, addTwo)