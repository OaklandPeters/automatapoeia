/**
 * Monoids are one of the most commonly encountered and studied
 * structures. However, it is also a very simple structure - and
 * it has no notion of how to get data *into* the category.
 * 
 * We will introduce with 'liftable', which will give us Flattenable,
 * and eventually Monad.
 * 
 * Monoids are defined by their binary opertion, and an identity element.
 * In this library, we are calling these 'append' and 'zero'.
 *
 * Note: Monoids are not necessarily containers, and hence are not
 *   necessarily generic-classes either.
 * 
 */
import {IZeroable, Zeroable, zero} from './zeroable';
import {IAppendable, Appendable, append} from './appendable';
import {Foldable, fold, From as FoldableFrom} from './foldable';
import {equal} from './equatable';
import {LawTests, assert} from './cat_support';


/* Interfaces
======================== */
interface IMonoid extends IAppendable, IZeroable {
	equal(other: any): boolean;
	append(other: IMonoid): IMonoid;
	zero(): IMonoid;
} declare var IMonoid: {
	zero(): IMonoid;
}

/* Abstract Base Classes
with 'is' type-checking static method
========================================= */
abstract class Monoid implements IMonoid {
	abstract equal(other: any): boolean;
	abstract zero(): Monoid;
	abstract append(other: Monoid): Monoid;
	static zero: () => Monoid;
	static is(value: any): value is Monoid {
		return (
			Zeroable.is(value)
			&& Appendable.is(value)
		)
	}
}

/* Typechecking functions
================================================= */


/* Generic functions
for each abstract method
================================================ */


/* Derivable functions
these are the real stars of the show - the functions
implied from the interfaces
========================================================== */
function combine<U extends IMonoid>(base: U, ...rest: Array<U>): U {
	return fold<U, U>(
		FoldableFrom.Array(rest),
		(accumulator: U, element: U) => append(accumulator, element),
		base
	)
}


function repeat<U extends IMonoid>(monoid: U, count: number): U {
	/*
	By analogy, if 'append' is 'plus', this function is multiplication.

	@todo: type check count as an integer
	 */
	 let accumulator = monoid.zero() as U;
	 for(let i = 0; i <= count; i=i+1) {
	 	accumulator = append(accumulator, monoid) as U;
	 }
	 return accumulator
}



/* Metafunctions
Functions that modify or decorate morphisms in this category
============================================================== */


/* Constructors
convert between elements (~instances) of two categories
==================================== */
var From = {
	Number: function monoidFromNumber(num: number): Monoid {
		return new Native.Number(num);
	},
	Array: function monoidFromArray<T>(array: Array<T>): Monoid {
		return new Native.Array(array);
	},
	String: function monoidFromString<T>(_string: string): Monoid {
		return new Native.String(_string);
	}
};


/* Functors
convert between morphisms (~functions) of two categories.
==================================== */


/* Native versions
equivalents to this categories' method,
for built-in Javascript types
====================================== */
let Native = {
	Number: class NumberMonoid implements IMonoid {
		constructor(public data: number) { }
		append(other: NumberMonoid): NumberMonoid {
			return new NumberMonoid(this.data + other.data)
		}
		zero(): NumberMonoid {
			return new NumberMonoid(0)
		}
		equal(other: NumberMonoid | any) {
			if (other instanceof NumberMonoid) {
				return (this.data === other.data)
			} else {
				return false
			}
		}
	},
	Array: class ArrayMonoid<T> implements IMonoid {
		constructor(public data: Array<T>) { }
		append(other: ArrayMonoid<T>): ArrayMonoid<T> {
			return new ArrayMonoid(this.data.concat(other.data))
		}
		zero<U>(): ArrayMonoid<U> {
			return new ArrayMonoid([] as Array<U>)
		}
		equal(other: any): boolean {
			if (other instanceof ArrayMonoid) {
				return (this.data === other.data)
			} else {
				return false;
			}
		}
	},
	String: class StringMonoid implements IMonoid {
		constructor(public data: string) { }
		append(other: StringMonoid): StringMonoid {
			return new StringMonoid(this.data + other.data);
		}
		zero(): StringMonoid {
			return new StringMonoid("");
		}
		equal(other: any): boolean {
			if (other instanceof StringMonoid) {
				return (this.data === other.data);
			} else {
				return false;
			}
		}
	}
};

/* Laws
Assertion functions expressing something which must
be true about the category for it to be sensible, and
are part of its definition, but are not expressible
in the type-system.
================================================= */
class MonoidLaws<M extends Monoid, N> extends LawTests<M> {
	/**
	 * OVerride this for any particular monoid class.
	 * Requires an argument 'random' which is a function generating
	 *
	 * @todo: Make 'N' a MonoidMorphism
	 */
	// random: (seed: number) => M;
	// seed: number;
	// klass: {new: (values: Array<any>) => M};
	objectKlass: {new: (values: Array<any>) => M};
	objectRandom: (seed: number) => M;	
	morphismKlass: {new: (values: Array<any>) => N};
	morphismRandom: (seed: number) => N;
	seed: number;

	constructor(objectKlass: {new: (values: Array<any>) => M},
		        objectRandom: (seed: number) => M,
				seed: number = 0) {
		super(objectKlass, objectRandom, seed);
	}

	test_leftAppendEquality(): void {
		// x + 0 === x
		let x = this.objectRandom(this.seed);
		assert(equal(append(x, zero(x)), x),
			"Failed left append equality: 'x + 0 === x', for seed = {this.seed}");
	}

	test_rightAppendEquality(): void {
		// 0 + x === x
		let x = this.objectRandom(this.seed);
		assert(equal(append(zero(x), x), x),
			"Failed right append equality: '0 + x === x', for seed = {this.seed}");
	}

	test_append_identity_law(): void {
		let monoid = this.objectRandom(this.seed);
		let left = append(zero(monoid), monoid);
		let right = append(monoid, zero(monoid));
		assert(monoid.equal(left));
		assert(monoid.equal(right));
		assert(left.equal(right));
	}
}


/* Exports
==================== */
export {
	IMonoid, Monoid,
	combine, repeat,
	From, Native,
	MonoidLaws
}
