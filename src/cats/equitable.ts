/**
 * Provides interfaces and utility functions for testing equality.
 *
 * @todo: Think about 'bounded' equitable. Which is basically a static method,
 * 	which evaluates two objects in that sense.
 */


/* Interfaces
======================== */
interface IEquatable {
	/* Container data-types supporting equality comparison.
	Equitable allows for *possibly* comparing to other types.

	NOTE: I need to think *a* *lot* about the other types of equitable, such as for
	mappable ones, which can/should be equitable over the internal types.
	*/

	// I'm very unhappy with this signature
	// It doesn't have the ability to communicate that both 'this' and 'other'
	// have to meet some interface in order to be Equitable
	equal(other: any): boolean;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Equatable implements IEquatable{
	abstract equal(other: any): boolean;
	static is(value: any): value is Equatable {
		return (value.equal instanceof Function)
	}
}


/* Typechecking functions
================================================= */


/* Generic functions
for each abstract method
================================================ */
function equal<T>(left: IEquatable, other: any): boolean {
	return left.equal(other)
}

function notEqual<T>(left: IEquatable, other: any): boolean {
	return !(left.equal(other))
}


function equalAs<Left extends Base, Right extends Base, Base extends IEquatable>(
	left: Left, right: Right, base: {new(data: any): Base}
	): boolean {
	/* Compare two objects for equality, but using the equality-function from some
	concrete OR abstract base class which they both meet.
	Note: 'base' is expected to be a class object, rather than an instance. */
	return base.prototype.equal.call(left, right)
}



/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */
function isEqual(left: any, right: any): boolean {
	/* Checks equality, dispatching over 'equal' methods if they exist; if not
	then checks equality with '==='. */
	if (left.equal instanceof Function) {
		return left.equal(right)
	} else if (right.equal instanceof Function) {
		return right.equal(left)
	} else {
		return (left === right)
	}
}


/* Functors
to/from common data types
==================================== */

/* Exports
==================== */
export {
	isEqual
}