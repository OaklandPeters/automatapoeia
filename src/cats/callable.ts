/**
 * Callable represents a objects that can be called, similar to a function.
 * This is the same behavior as Javascript's Function.call() method.
 * Hiowever, because of the language symantics of Javascript, Callable objects
 * generally cannot be called through the normal method: 'func(arg)',
 * and must be called through the 'call' method.
 * 
 * Context:
 * Callable plays a similar role for function-based categories, that
 * Foldable plays for data-based categories - namely, it is a Catamorphism
 * that allows you to 'collapse' or 'fold-up' the structure.
 *
 * Callable might be called 'Apply' in the Haskell community
 */


/* Interfaces
======================== */
interface ICallable<Input, Output> {
	call(input: Input): Output;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Callable<Input, Output> implements ICallable<Input, Output> {
	abstract call(input: Input): Output;
	static is<Input, Output>(value: any): value is Callable<Input, Output> {
		return (value.call instanceof Function);
	}
}

/* Generic functions
for each abstract method
================================================ */
function call<Input, Output>(callable: ICallable<Input, Output>, input: Input): Output {
	return callable.call(input);
}

/* Constructors
convert between elements (~instances) of two categories
==================================== */
class CallableFunction<Input, Output> extends Callable<Input, Output> {
	constructor(
		public func: (input: Input) => Output
	) {
		super();
	}
	call(input: Input): Output {
		return this.func(input);
	}
}

var From = {
	Function: function functionToCallable<Input, Output>(func: (input: Input) => Output): Callable<Input, Output>{
		return new CallableFunction(func);
	}
};

var To = {
	Function: function callableToFunction<Input, Output>(callable: Callable<Input, Output>): (input: Input) => Output {
		return callable.call
	}
};

/* Native versions
equivalents to this categories' method,
for built-in Javascript types
====================================== */
var Native = {
	Function: function callFunction<Input, Output>(func: (input: Input) => Output, input: Input): Output {
		return func(input);
	}
};

/* Exports
==================== */
export {
	ICallable, Callable, call,
	CallableFunction,
	From, To, Native
}
