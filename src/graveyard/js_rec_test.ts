function isRecursiveArray(value) {
	return ((value.length !== undefined) && (value.map !== undefined));
}

function recursiveArrayBind(func) {
	function wrapper(value) {
		if (isRecursiveArray(value)) {
			return value.map(function(elm, index, array) {
				return wrapper(elm)
			})
		} else {
			return func(value)
		}
	}
	return wrapper
}


// 		return array.map(function(value, index, array) {
// 			if (isRecursiveArray(value)) {
// 				return wrapper(value)
// 			} else {
// 				return func(value, index, array)
// 			}
// 		})
// 	}
// 	return wrapper
// }

function addTwo(x){ return x + 2 }
var recAddTwo = recursiveArrayBind(addTwo)
var nested = [[1, 2], [3, 4], [5], 6, [[7, 8]]]

var result = recAddTwo(nested);
console.log(result)