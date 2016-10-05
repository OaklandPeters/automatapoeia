/**
 * Category of objects which can be reasonably type-checked at run-time,
 * while providing support for TypeScript type-gaurds.
 *
 * This file is primarily used to provide type-gaurds for built-in data
 * types, which are used in this fashion:
 * 		if(NumberType.is(x)) {
 * 			// TS will let you use x like a 'Number' here
 * 		}
 *
 * NOTE - one very important type-checking
 */
import {Foldable, all} from './foldable';


/* Interfaces
======================== */
interface ITypeCheckable {
	/* Applies to class objects, not their instances.
	Note: 'declare' used here to add static methods to the interface.
	*/
} declare var ITypeCheckable: {
	is(value: any): boolean;
}

type TypeChecker = {
	is: <T>(value: any) => value is T
}

/* Abstract Base Classes
========================================= */
abstract class TypeCheckable implements ITypeCheckable {
	/* Because this is the abstract pattern for a class with a static
	'is' method, TypeCheckable.is(x) doesn't actually work for type-checking.
	Use 'isTypeCheckable(x)' instead
	*/
	static is: (value: any) => boolean;
}

/* Typechecking functions
================================================= */
function isTypeCheckable(value: any): value is TypeCheckable {
	return (value.is instanceof Function)
}


/* Generic functions   (for each abstract method)
================================================== */
function isType<T extends TypeCheckable>(
	value: any,
	typecheckable: {is: (value: any) => boolean} & T
	): value is T {
	/* This function be called 'is', but 'is' is a reserved word in TypeScript */
	return typecheckable.is(value)
}

function isTypeFoldableContaining<T extends TypeCheckable, U extends Foldable<T> & TypeCheckable>(
	value: any,
	OuterType: {is: (value: any) => boolean, new: (values: any) => U},
	InnerType: {is: (value: any) => boolean, new: (values: any) => T}
	): value is U {
	/**
	 * Check the outer type and inner (contained) types of a generic object.
	 * This is a very valuable function - but it is one of the only ways to
	 * determine anything about the inner-types of a structure.
	 *
	 * TECHNICALLY - this can be executed on any foldable data-structure, but it
	 * is probably only meaningful on Liftable/generic data containers.
	 * These will often be monads - and other variants of this function can
	 * be expressed for those (generally based on 'map' rather than 'fold').
	 */
	if (OuterType.is(value)) {
		if (all(value, (inner) => InnerType.is(inner))) {
			return true;
		}
	}
	return false;
}


/* Derivable functions
these are the real stars - the functions implied from the interfaces
========================================================== */
class AnyType implements ITypeCheckable {
	/* Runtime-typechecking equivalent of the Typescript 'any' type.
	Acts as the Identity and Zero function for '&&' Type-Checking. Also used as the
	default value in such situations, since for any class 'Klass' and value 'x':
		Klass.is(x)
			==
		Klass.is(x) && Any.is(x)
	*/
	static is(value: any): value is AnyType {
		return true
	}
}

class NoneType implements ITypeCheckable {
	/* Less commonly used than 'Any', but still useful at times. Since 'None' is the 'zero'
	property of 'or' while type-checking. For example, for any class 'Klass' and value 'x'
		(Klass.is(x))
			==
		(Klass.is(x) || None.is(x))
	*/
	static is(value: any): value is NoneType {
		return false
	}
}

class PrimitiveType implements TypeCheckable {
	/* Checks for Non-Object primitive types.
	*/
	static is(value: any): value is PrimitiveType {
		switch (typeof value) {
			case 'boolean':
			case 'string':
			case 'symbol':
			case 'undefined':
			case 'number':
			case 'function':
				return true;
			default:
				return false;
		}
	}
}

class BooleanType extends Boolean implements ITypeCheckable {
	static is(value: any): value is (boolean & Boolean) {
		return (typeof value === "boolean")
	}
}

class NumberType extends Number implements ITypeCheckable {
	static is(value: any): value is (number & NumberType & Number) {
		return (typeof value === "number")
	}
}

class StringType extends String implements ITypeCheckable {
	static is(value: any): value is (string & StringType) {
		return (typeof value === "string")
	}
}

class ObjectType extends Object implements ITypeCheckable {
	/*
	Note Null is an object in Javascript. */
	static is(value: any): value is (Object & ObjectType){
		return (typeof value === 'object')
	}
}

class FunctionType extends Function implements ITypeCheckable {
	static is(value: any): value is (Function & FunctionType) {
		return (typeof value === 'function')
	}
}

class NullType implements ITypeCheckable {
	static is(value: any): value is (NullType) {
		return (value === null)
	}
}

class UndefinedType implements ITypeCheckable {
	static is(value: any): value is (UndefinedType) {
		return (typeof value === 'undefined')
	}
}


/* Exports
==================== */
export {
	ITypeCheckable, TypeCheckable,
	isTypeCheckable, isType,
	AnyType, NoneType, PrimitiveType,
	BooleanType, NumberType, StringType, ObjectType, FunctionType, NullType
}
