/**
 * 
 * 
 * Motivation: I end up doing a lot of 'is' checks on classes, and these
 * tools simplify that.
 */

/*
Examples of use:
typeCheck(myClass, {parent: Manifold, coordinate: Coordinate})
typeCheck(myKind, {})
 */
// interface ITypeAtom {
// 	is: (value: any) => boolean;
// }

// function isITypeAtom(value: any): value is ITypeAtom {
// 	return (value.is instanceof Function)
// }

class ITypeAtom {
	is: (value: any) => boolean;

	// TypeAtom.is(value) Checks whether an object is a typeatom (~has an is)
	static is(value: any): value is TypeAtom {
		return (value.is instanceof Function)
	}
}


type ILiteral = string | number | void | Array<any>;

function isILiteral(value: any): value is ILiteral {
	return (
		typeof value === 'string'
		|| typeof value === 'number'
		|| value === undefined
		|| value instanceof Array
	)
}

interface IObjectSignature {
	[key: string]: ITypeAtom | ILiteral | IObjectSignature;
}

class ObjectSignature {
	[key: string]: ITypeAtom | ILiteral | IObjectSignature;
}

function isObjectSignature(value: any): value is ObjectSignature {
	/* This condition is very loose */
	return (   !isITypeAtom(value)
			&& !isILiteral(value)
			&& ObjectType.is(value))
}


type IType = ITypeAtom | IObjectSignature | ILiteral;

function isIType(value: any): value is IType {
	return (
		isITypeAtom(value)
		|| isILiteral(value)
		|| isIObjectSignature(value)
	)
}

function compareType(value: IType, type: IType): boolean {
	if (isITypeAtom(value)) {

	} else if (isLiteral(value)) {

	} else {

	}
}


interface IObjectPath {
	// var k = {'address': ['line1', 'line2']}
	// k at ['address', 0] --> 'line1'
	[index: number]: number | string;
}

interface ITypeViolations {
	/*
	Show what went wrong in a type-violation
	 */
	// [Path, Should-be-type]
	[index: number]: [IObjectPath, ITypeAtom]
}




function objectTraversalIterator(structure: IObjectSignature): [IObjectPath, ] {
	/*
	Functor: SimpleObject --> Array [Path, value]
	@todo: Simplify this name
	 */
	let accumulator = [];

	for (let key in structure) {
		if (structure.hasOwnProperty(key))
	}
}

function structuralTypeChecker(subject: any, structure: IObjectSignature, path: Array<string|number> = []): [boolean, Object] {
	/*
	Clearer refactoring:
	(1) object traversal: recursively loops down structure, and has the .hasOwnProperty part
		Also conditions the loop on (!isITypeAtom(value) && (ObjectType.is(value)))
		returns iterable of pairs: [IObjectPath, value]
	(2) Should only return ITypeViolations. To get truth value, check the length of that.
	 */
	let matches = true;
	let accumulator = {};


	// Base case
	if (subject === undefined) {
		return [false, {}]; // === [false, {}]
	}


	for (let key in structure) {
		if (structure.hasOwnProperty(key)) {
			let value = subject[key];
			// let result: boolean;
			// Recursion happens on object literals
			if (!isITypeAtom(value) && (ObjectType.is(value))) {
				let result: boolean;
				let submatch: Object;
				[result, submatch] = structuralTypeChecker(subject[key], value)

				matches = matches && result;
			// 
			} else if (isITypeAtom(value)){

			// Treat as a literal comparison
			} else {
				return 
			}
		}
	}

	return [matches, accumulator]
}


// Utilities for working with builtin Javascript data types
class StringType extends String {
	static is(value: any): value is String {
		return ((value instanceof String) || (typeof value === 'string'))
	}
}

class NumberType extends Number {
	static is(value: any): value is Number {
		return ((value instanceof Number) || (typeof value === 'number'))
	}
}

class AnyType {
	static is(value: any): value is any {
		return true
	}
}

class ObjectType extends Object {
	static is(value: any): value is Object {
		return (typeof value === 'object')
	}
}