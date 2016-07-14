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
