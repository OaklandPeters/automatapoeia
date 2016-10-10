/**
 * Invokable represents a objects that can be called, similar to a function.
 * This is similar behavior as Javascript's Function.call() method.
 * Hiowever, because of the language symantics of Javascript, Invokable objects
 * generally cannot be called through the normal method: 'func(arg)',
 * and must be called through the 'invoke' method.
 * 
 * Context:
 * Invokable plays a similar role for function-based categories, that
 * Foldable plays for data-based categories - namely, it is a Catamorphism
 * that allows you to 'collapse' or 'fold-up' the structure.
 *
 * Invokable is plays a similar role to 'Callable' in Python, or 'Apply' in Haskell.
 * The only reason that Invokable is not named 'Callable'/'Apply', is to avoid conflict
 * with Javascript's built-in call/apply methods.
 */


/* Interfaces
======================== */
interface IInvokable<Input, Output> {
	invoke(input: Input): Output;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Invokable<Input, Output> implements IInvokable<Input, Output> {
	abstract invoke(input: Input): Output;
	static is<Input, Output>(value: any): value is Invokable<Input, Output> {
		return (value.invoke instanceof Function);
	}
}

/* Generic functions
for each abstract method
================================================ */
function invoke<Input, Output>(invokable: IInvokable<Input, Output>, input: Input): Output {
	return invokable.invoke(input);
}

/* Constructors
convert between elements (~instances) of two categories
==================================== */
class InvokableFunction<Input, Output> extends Invokable<Input, Output> {
	constructor(
		public func: (input: Input) => Output
	) {
		super();
	}
	invoke(input: Input): Output {
		return this.func(input);
	}
}

var From = {
	Function: function functionToInvokable<Input, Output>(func: (input: Input) => Output): Invokable<Input, Output>{
		return new InvokableFunction(func);
	}
};

var To = {
	Function: function invokableToFunction<Input, Output>(invokable: Invokable<Input, Output>): (input: Input) => Output {
		return invokable.invoke
	}
};

/* Native versions
equivalents to this categories' method,
for built-in Javascript types
====================================== */
var Native = {
	Function: function invokeFunction<Input, Output>(func: (input: Input) => Output, input: Input): Output {
		return func(input);
	}
};

/* Exports
==================== */
export {
	IInvokable, Invokable, invoke,
	InvokableFunction,
	From, To, Native
}
