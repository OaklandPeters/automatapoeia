/**
 * Category container with a defined, and easily determinable, size.
 * Iterators and generators are generally not sized, but Arrays are.
 *
 * One way that 'sized' is relevant, is that any sized and iterable collection
 * can be converted into an enumerable one.
 */


/* Interfaces
======================== */
interface ISized {
	length: number;
}


/* Abstract Base Classes
========================================= */
abstract class Sized {
	length: number;
	static is(value: any): value is Sized {
		return (typeof value.length === 'number')
	}
}

/* Generic functions
================================================ */
function length(sized: ISized): number {
	return sized.length;
}

/* Exports
==================== */
export {
	ISized, Sized, length
}