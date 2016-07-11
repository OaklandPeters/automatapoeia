
interface ITypeCheckable {
	/* Applies to class objects, not their instances. */
	is(value: any): boolean;
	new(m: any): Object;
	// is: any;
}

abstract class TypeCheckable {
	static is(value: any): value is TypeCheckable {
		return (value['is'] instanceof Function)
	}
}

function is<T extends TypeCheckable>(
	value: any,
	typecheckable: {is: (value: any) => boolean}
	): value is T {
	return typecheckable.is(value)
}



class Foldable<T>{
	is<T>(value: any): value is Foldable<T> {
		return (value['is'] instanceof Function)
	}
}

// x === number, x === string
// 
class Primitive implements TypeCheckable {
	/* Checks for Non-Object primitive types
	Boolean
	
	Undefined
	Number
	String
	Symbol (new in ECMAScript 6)
	Function


	Null
	Note Null is an object
	 */
	static is(value: any): value is Primitive {
		switch (typeof value) {
			case 'boolean':
			case 'string':
			case 'symbol':
			case 'undefined':
			case 'number':
				return true;
			default:
				return false;
		}
	}
}