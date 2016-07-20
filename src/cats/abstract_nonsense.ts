/*
Advanced and abstract functions which I've written, out of curiosity or a a challenge.
... but which I don't think should actually be used. This is usually because they
are impractically abstract.
 */


/*
_as() meta-function - used to call a method on an object, but using the method from
another class

In practice, it is intended to be a generic-ization of this pattern:
	function fold<T, U>(foldable: Foldable<T>, f: (first: U, second: T) => U, initial: U): U {
		return foldable.fold(f, initial)
	}

	function foldAs<T, U, Subject extends Klass, Klass extends Foldable<T>>(
		subject: Subject,
		base: {new(data: any): Klass}
		f: (first: U, second: T) => U,
		initial: U
		): U {
		return base.prototype.fold.call(subject, f, initial)
	}

	class Sequence<T> {
		// ...
		equal(other: Sequence<T>): boolean {
			return all(
				Sequence.map((index, value) => (value===other.getitem(index)))
		}
	}

	type Rest<T, U> = [(first: U, second: T) => U, U];

	let base = List as List<U>;


	var _foldAs = _as<Foldable, U, Rest<T, U>>()()

 */
function _as<Context extends Base, Base, Result, OtherArgs>(context: {new(data: any): Context}) {
	/*
	Note: It's entirely valid for Context = Base, in cases where that function
	already has an implementation on Base (IE it's not abstract). Such as when
	'Subject' is a child class of 'Base', and specializes one of the methods.
	_as<Parent, Parent>(Parent) can be used to access that parent method -
	basically as a 'super()' call.


	Constraint:
	FunctionBoundary needs to bound the function interface for all three cases.
	IE whatever function is retreived by getter, is expected to be compatible
	witht he one expressed on Base
		getter(Base.prototype): FunctionBoundary
	AND
		getter(context): FunctionBoundary
	AND
		getter(subject): FunctionBoundary
	 */
	
	type Method<Subject> = (subject: Subject, ...rest: OtherArgs): Result
	// FunctionBoundary: the Method without the subject
	type FunctionBoundary = (...rest: OtherArgs) => Result;

	function wrapper<Subject extends Base>(getter: (subject: Base) => FunctionBoundary): Method<Subject> {
		// Note - you can ALSO construct a getter out of a function name
		function wrapped(subject: Subject, ...rest: OtherArgs): Result {
			return getter(base.prototype).apply(subject, rest);
		}
		return wrapped
	}
}


/*
Protocol for type-checking generics
 */
import {ITypeCheckable, TypeCheckable} from './typecheckable';
import {IFoldable, Foldable, all} from './foldable';

type Class<T> = {new(...values: Array<any>): T}

interface TypeCheckableGeneric {
	// The arguments on this are complicated
	static isGeneric(value: any, ...inners: Array<any>): boolean;
}

class OneParameterGeneric<A> implements IFoldable<A> {

	static isGeneric<A, InnerA extends Class<A> & ITypeCheckable>(
		value: any, innerA: InnerA): value is OneParameterGeneric<A> {
		return all(this, (x: any) => innerA['is'](x))
	}
}

class Any implements ITypeCheckable {
	/* Acts as the Identity and Zero function for Type-Checking. Also used as the
	default value for type-checking. */
	is(value: any): value is Any {
		return true
	}
}

class TwoParameterGeneric<A, B> implements Foldable<[A, B]> {
	static is<A, B>(
		value: any,
		innerA?: Class<A> & ITypeCheckable,
		innerB?: Class<B> & ITypeCheckable
		): value is TwoParameterGeneric<A, B> {
		let isA = 
		return (
			(TwoParameterGeneric._is(value))
			&& (TwoParameterGeneric.isGeneric())
		)
	}
	static _is(value: any): value is TwoParameterGeneric<any, any> {
		// Do all of your standard type-checking here
	}
	static isGeneric<A, B, InnerA extends Class<A> & ITypeCheckable, InnerB extends Class<B> & ITypeCheckable>(
		value: any,
		innerA: InnerA = {is: (value: any) => true},
		innerB?: InnerB): value is TwoParameterGeneric<A, B> {
		// Presumes: fold<U>(f: ([x: A, y: B]) => U)
		
		let comparitor = function (x: A, y: B) {
			let acc = true
			if (innerA !== undefined) {
				acc = acc && innerA.is(x);
			}
			if (innerB !== undefined) {

			}
		}

		this.fold<boolean>(
			function (accumulator: boolean, [x: A, y: B]): boolean {
				if (innerA !== undefined)
			},
			true
		)

		return all(this, ([x: A, y: B]) => (innerA['is'](x) && innerB['is'](y)))
	}
	static isGenericA<A, InnerA extends Class<A> & ITypeCheckable>(
		value: any, innerA: InnerA): boolean {

	}
}


/*
I'd love to be able to re-bind generics, and what follows is me trying to simulate that idea.initializeArray(
You can't do this in TypeScript:

function foldInto<A, B, L extends Foldable<A>, R extends Monoid<B>>(left: L, right: R
	): L<B> { ... }

Because there is no way to refer to the 'L<B>' - the best we can do is setting the return 
type to `Foldable<B>`, Although this could be described if we already new the name of whatever L is.

Basically, there are difficulties when combining F-Bounded Polymorphism and Generics

 */
interface Monoid<T> {
	append;
	zero;
}

function typeClosure<A, B>(){
	type LBound = Array<A>;
	type RBound = Monoid<B>;

	function foldInto<L extends LBound, R extends RBound>() {

	}
}