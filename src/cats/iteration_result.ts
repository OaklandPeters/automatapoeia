/**
 * The result of a single step of an iterator.
 * Denotes whether or not the iteration terminated, and, if not,
 * the value reuslting from that step.
 * Very similar to the 'Maybe' monad.
 */

/* Interfaces
======================== */
// IterationResult is already defined in TypeScript, via ES6 collections
// I'm defining this a bit differently - as a union type, to aid type-guards.
type IterationResult<T> = IterationDone<T> | IterationValue<T>;
type Morphism<T, U> = (element: IterationResult<T>) => IterationResult<U>;


// IterationDone/IterationValue specified as classes rather than interface
// so 'done' can be explicitly specified.
class IterationDone<T> {
	done = true;
}

class IterationValue<T> {
	done = false;
	value: T;
}

/* Typechecking functions
================================================= */
function isDone<T>(value: IterationResult<T>): value is IterationDone<T> {
	return Boolean(value.done)
}

function isNotDone<T>(value: IterationResult<T>): value is IterationValue<T> {
	return (!Boolean(value.done));
}

/* Generic functions
for each abstract method
================================================ */


/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */

/* Metafunctions
Functions that modify or decorate morphisms in this category
============================================================== */
function apply<T, U>(result: IterationResult<T>, f: (element: T) => U): IterationResult<T> {
	/*  Applies function to result, if the result is not done. If it is done, it
	simply returns IterationDone. */
	if (isNotDone<T>(result)) {
		return {
			done: false,
			value: f(result.value)
		}
	} else {
		return {done: true}
	}
}

/* Constructors
convert between elements (~instances) of two categories
==================================== */


/* Functors
convert between morphisms (~functions) of two categories.
==================================== */
function fmap<T, U>(f: (value: T) => U): Morphism<T, U> {
	/* Turns a normal function into a function on IterationResults.
	Basically just a decorator/lazy-evaluation version of 'apply'. */
	return function morphism(element: IterationResult<T>): IterationResult<U> {
		return apply<T, U>(element, f)
	}
}


/* Exports
==================== */
export {
	IterationResult, IterationDone, IterationValue,
	isDone, isNotDone,
	apply, fmap
}