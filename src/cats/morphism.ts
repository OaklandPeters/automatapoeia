/**
 * 
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
import {updateObject} from './cat_support';











/* Interfaces
======================== */
// IMorphism: 'T' is related to the Domain or Category of the Morphism.
// It acts much like the class - in defining attributes and methods for a Morphism
type IMorphism<Input, Output, T> = ((input: Input) => Output) & IInvokable<Input, Output> & T;


/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
// We cannot define a normal Morphism class or abstract class, and have
// it act as a normal function.
// BUT - we can define a factory function which will define something that
// behaves the same way
function createMorphism<A, B, T extends IInvokable<A, B>>(invokable: T): IMorphism<A, B, T> {
    /**
     * We have two related objects.
     * invokable - an object in JS terms.
     *     This cannot be directly called via normal Javascript, although its methods can
     * morphism - constructed by this function.
     * 	   Usable as a normal Javascript function, but also has access to all attributes
     * 	   and methods of the 'invokable' object.
     */
	function f(arg: A): B {
		return this.invoke(arg);
	}
	let bound = f.bind(invokable);
	bound.__proto__ = (invokable as any).__proto__;
	return updateObject<Function, T>(bound, invokable) as IMorphism<A, B, T>;
	
}


/* Generic functions
for each abstract method
================================================ */

/* Type-Guards: Type-checking functions
================================================= */

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
};

/* Exports
==================== */
export {
	IMorphism, createMorphism
}
