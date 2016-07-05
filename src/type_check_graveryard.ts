//
//	Previous version, where I had these interfaces implemented
//	via the 'interface' keyword
//	... before I decided to use classes instead
//
interface ITypeAtom {
	is: (value: any) => boolean;
}

function isITypeAtom(value: any): value is ITypeAtom {
	return (value.is instanceof Function)
}

interface IObjectSignature {
	[key: string]: ITypeAtom | ILiteral | IObjectSignature;
}

function isObjectSignature(value: any): value is ObjectSignature {
	/* This condition is very loose */
	return (   !isITypeAtom(value)
			&& !isILiteral(value)
			&& ObjectType.is(value))
}



	// map<U>(f: (value: RecursiveArray<T> | T, path: Array<number>) => U): Manifold<U> {
	// 	function adaptor(x: RecursiveArray<T>|T, p: Array<number>): RecursiveArray<U>|U {
	// 		if (isRecursiveArray(x)) {
	// 			// return x.map((elm, i) => adaptor(elm, p.concat([i])))
	// 			return x.map(function(elm: T|RecursiveArray<T>, i: number): RecursiveArray<U>|U{
	// 				return adaptor(elm, p.concat([i]))
	// 			})
	// 		} else {
	// 			return f(x, p)
	// 		}
	// 	}
	// 	// let val = this.data.map((x) => x) // Array<RecursiveArray<T>|T>
	// 	return this.data.map<U>(adaptor);
	// }