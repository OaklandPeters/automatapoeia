/**
 * Fancy function. Can be invoked as a JS function, but also has attributes and methods.
 * Morphism = Invokable & Function
 * Basically always, we will want 'Morphism in category X', but I realize it isn't actually logically required. 
 *
 * My intention with this is that a Morphism, is a fancy function which
 * expresses both a function-like signature, and a class-like signature.
 * Morphisms will always be within a category.
 *
 * This file will include utility constructors for making these
 *
 *
 * A few possible strategies for setting up a morphism:
 * (1) Simply mark a Function with the interface
 * (2) Factory function - pass in a class
 * (3) Build up a function object in the old-schol Javascript way, then mark it
 *     with the appropriate type-script interface
 * (4) Wrap up a class object inside a function, which calls the object's 'call'
 *
 *
 * Example of how this is used:
 * 	import {Foldable} from './foldable';
 *  function experiment(x: number): number { return x + 3; }
 *  var morph = makeMorphism<number, number, InvokableFunction<number, number>>(new InvokableFunction(experiment));
 *  morph.invoke // TS knows this is valid
 *  morph.nonsense  // TS complains about this
 */
import {IInvokable, Invokable, InvokableFunction} from './invokable';
import {updateObject, Buildable, Constructible} from './cat_support';
import {AnyType} from './typecheckable';




/* Interfaces
======================== */

// IMorphism: 'T' is related to the Domain or Category of the Morphism.
// It acts much like the class - in defining attributes and methods for a Morphism
/**
 * IMorphism has three parameters:
 *  
 * 
 */
type IMorphismObject<T, Input, Output> = IInvokable<Input, Output> & T;
type IMorphism<T, Input, Output> = ((input: Input) => Output) & IInvokable<Input, Output> & T;


/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Morphism<A, B> implements IInvokable<A, B> {
	/** 
	 * Big weird quirk: direct instances of abstract class Morphism do not satisfy
	 * IMorphism (because they don't count as a function), but the result of 
	 * Morphism.create() - DO satisfy IMorphism.
	 *
	 * ... same goes for the morphism-domain 'T'
	 * 
	 * So the most correct 'constructor' for Morphism is actually 'create'.
	 */
	abstract invoke(input: A): B;
	// static create<T extends IInvokable<A, B>, A, B>(invokable: T): IMorphism<T, A, B> {
	// 	function f(arg: A): B {
	// 		return this.invoke(arg);
	// 	}
	// 	let bound = f.bind(invokable);
	// 	bound.__proto__ = (invokable as any).__proto__;
	// 	return updateObject<Function, T>(bound, invokable) as IMorphism<T, A, B>;
	// }
	static create<A, B>(func: (input: A) => B): IMorphism<Morphism<A, B>, A, B> {
		/**
		 * Warning - when inheriting from abstract class Morphism this function 'create'
		 * *should* execute correctly at run-time, BUT the signature inferred via
		 * TypeScript will be too loose.
		 *
		 * Ex. 
		 * class ListMorphism<A, B> extends Morphism<A, B> { //... }
		 * let morph = new ListMorphism<string, number>((word: string) => word.length);
		 * morph inferred to be:
		 *    IMorphism<Morphism<string, number>, string, number>
		 * But should be:
		 *    IMorphism<ListMorphism<A, B>, A, B>
		 *
		 * You can over-ride the type-signature for 'create' on the child class to tighten this up
		 * Ex.
		 * class ListMorphism<A, B> extends Morphism<
		 */
		let _morphismObject = new (this.constructor as Constructible<Morphism<A, B>>)(func);
		let bound = func.bind(_morphismObject);
		bound.__proto__ = (_morphismObject as any).__proto__;
		return updateObject<Function, Morphism<A, B>>(bound, _morphismObject) as IMorphism<Morphism<A, B>, A, B>;
	}
	static is<Input, Output, T>(
		value: any, category: {is: (value: any)=>boolean, new: (values: any[]) => T} = AnyType as any
		): value is IMorphism<T, Input, Output> {
		/**
		 * Since we cannot define an abstract base class for Morphism, this function
		 * plays the role of Morphism.is
		 */
		return (
			value instanceof Function
			&& Invokable.is(value)
			&& category.is(value)
		);		
	}
}


/* Generic functions
for each abstract method
================================================ */
function create<M extends IMorphism<T, A, B>, T extends IInvokable<A, B>, A, B>(
	morphismClass: {create(_invokable: T): IMorphism<T, A, B> }, 
	invokable: T): IMorphism<T, A, B> {
	return morphismClass.create(invokable);
}


/* Type-Guards: Type-checking functions
================================================= */
function isMorphism<T, Input, Output>(
	value: any, category: {is: (value: any)=>boolean, new: (values: any[]) => T} = AnyType as any
	): value is IMorphism<T, Input, Output> {
	/**
	 * Since we cannot define an abstract base class for Morphism, this function
	 * plays the role of Morphism.is
	 */
	return (
		value instanceof Function
		&& Invokable.is(value)
		&& category.is(value)
	);		
}

/* Laws
Assertion functions expressing something which must
be true about the category for it to be sensible, and
are part of its definition, but are not expressible
in the type-system.
================================================= */

/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */

/* Metafunctions
Functions that modify or decorate morphisms in this category
============================================================== */

/* Constructors
convert between elements (~instances) of two categories
==================================== */

//InvokableFunction
class FunctionMorphism<A, B> extends InvokableFunction<A, B> implements Morphism<A, B> {
	static create<A, B>(func: (input: A) => B): IMorphism<InvokableFunction<A, B>, A, B> {
		type T = InvokableFunction<A, B>;
		type ThisType = FunctionMorphism<A, B>;
		let _morphismObject = new (this.constructor as Constructible<ThisType>)(func);
		let bound = func.bind(_morphismObject);
		bound.__proto__ = (_morphismObject as any).__proto__;
		return updateObject<Function, T>(bound, _morphismObject) as IMorphism<T, A, B>;
	}
}

var From = {
};

var To = {
};

/* Functors
convert between morphisms (~functions) of two categories.
==================================== */

/* Native versions
equivalents to this categories' method,
for built-in Javascript types
====================================== */
var Native = {
	Function: function createFunctionMorphism<A, B>(
		func: (input: A) => B
		): FunctionMorphism<A, B> {
		return FunctionMorphism.create(func);
	}
};

/* Exports
==================== */
export {
	IMorphism, Morphism,
	isMorphism
}
