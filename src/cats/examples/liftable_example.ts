import {Liftable, ILiftable} from '../liftable';



/*  Advanced concepts
==================================== */
interface IBoundedLiftable<Bound, T extends Bound> extends ILiftable<T> {
	lift<U extends Bound>(value: U): IBoundedLiftable<Bound, U>;
}
declare var IBoundedLiftable: {
	new <Bound, U extends Bound>(value: U): IBoundedLiftable<Bound, U>;
	lift<Bound, U extends Bound>(value: U): IBoundedLiftable<Bound, U>;
}

// Duck-type version
abstract class BoundedLiftable<Bound, T extends Bound> extends Liftable<T> implements IBoundedLiftable<Bound, T> {
	abstract new(value: T): BoundedLiftable<Bound, T>;
	abstract lift<Bound, U extends Bound>(value: U): BoundedLiftable<Bound, U>;
	static lift: <Bound, U extends Bound>(value: U) => BoundedLiftable<Bound, U>;
	static is<Bound, U extends Bound>(value: any): value is BoundedLiftable<Bound, U> {
		return (value.lift instanceof Function)
	}
}









// 
// Example of BoundedLiftable
// 'NumericList<T> implements IBoundedLiftable<number, T>' might be a better example
import * as JQuery from 'jquery';


// Make restriction classes to set 'Element' as the Bound
// 
interface IElementLiftable<T extends Element> extends IBoundedLiftable<Element, T> {
	lift<U extends Element>(x: U): IElementLiftable<U>;
}
abstract class ElementLiftable<T extends Element> extends BoundedLiftable<Element, T> implements IElementLiftable<T> {
	abstract lift<U extends Element>(value: U): ElementLiftable<U>;
	static lift: <U extends Element>(value: U) => ElementLiftable<U>;
}


class JQueryLiftable<T extends Element> extends ElementLiftable<T> {
	value: T;
	jquery: JQuery;
	constructor(value: T) {
		super()
		this.value = value;
		this.jquery = JQuery(value);
	}
	lift<U extends Element>(value: U): JQueryLiftable<U> {
		// return new JQueryLiftable<U>(value)
		return JQueryLiftable.lift(value)
	}
	static lift<U extends Element>(value: U): JQueryLiftable<U> {
		return new JQueryLiftable<U>(value);
	}
}



let thing: typeof Array.prototype.map;

class Temp {
	map: typeof Array.prototype.map;
	static mapper: typeof Array.prototype.map;
	static arr: typeof Array;
}
// Temp.arr<number>
// Temp.mapper
// var stuff = new Temp();


class Vec<T> {
	constructor(public data: T){}
	contains(other: T): boolean {
		return (this.data === other)
	}
	static lift<U>(data: U): Vec<U> {
		return new Vec<U>(data)
	}
	lift<U>(data: U): Vec<U> {
		return new Vec<U>(data)
	}
	map<U>(f: (value: T) => U): Vec<U> {
		return this.lift<U>(f(this.data))
	}
}

class List<T> {
	constructor(public data: T){}
	contains(other: T): boolean {
		return (this.data === other)
	}
	static lift<U>(data: U): List<U> {
		return new List<U>(data)
	}
	lift<U>(data: U): List<U> {
		return new List<U>(data)
	}
	map<U>(f: (value: T) => U): List<U> {
		return this.lift<U>(f(this.data))
	}
}

interface IMappable<T> {
	map<U>(f: (value: T) => U): Mappable<U>;
}

class Mappable<T> {
	map<U>(f: (value: T) => U): Mappable<U>;
}


// function map<A, B, M extends Mappable<A>>(mappable: M, f: (value: A) => B) {

// 	typeof M.
// 	let temp = mappable.map(f)
// 	temp
// }


interface IMonoidStatic<T> {
	// new (value: T): IMonoid<T>;
	zero<U>(): IMonoid<U>;
	lift<U>(value: U): IMonoid<U>;
}
interface IMonoid<T> {
	// zero<U>(): IMonoid<U>;
	// lift<U>(value: U): IMonoid<U>;
	append(other: IMonoid<T>): IMonoid<T>;
}
interface Static_for_IMonoid<T, IM extends IMonoid<T>> {
	/*
	~ type Static_For<T, Thing<T>> = { new(value: T) => Thing<T>} & Thing
	*/
	new (value: T): IM;
	zero<U>(): IMonoid<U>;
	lift<U>(value: U): IMonoid<U>;
}

abstract class Monoid<T> implements IMonoid<T> {
	// abstract new(value: any): Monoid<T>;
	abstract append(other: Monoid<T>): Monoid<T>;
	static zero: <U>() => Monoid<U>;
	static lift: <U>(value: U) => Monoid<U>;
	// zero: <U>() => Monoid<U>;
	abstract zero<U>(): Monoid<U>;
	abstract lift<U>(value: U): Monoid<U>;
}

class StaticMonoid {
	zero: <U>() => Monoid<U>;
	lift: <U>(value: U) => Monoid<U>;
}


// declare var IMonoidStatic: {
// 	new <T>(value: T): IMonoid<T>;
// 	zero<U>(): IMonoid<U>;
// 	lift<U>(value: U): IMonoid<U>;
// }
interface ITransformable<T> {
	fold<U>(f: (first: U, second: T) => U, initial: U): U;
	transformTo(monoidClass: IMonoidStatic<T>): IMonoid<T>;
	// transformTo(monoidClass: new (value: T) => IMonoid<T>): IMonoid<T>;
	
}

// NOW: try to make a transformable structure
// The Monoid will be MonoidArray

class MonoidArray<T> extends Monoid<T> {
	constructor(public data: Array<T>){ super(); }
	static zero<U>(): MonoidArray<U> {
		return new MonoidArray([]);
	}
	zero<U>(): MonoidArray<U> {
		return new MonoidArray([]);
	}
	static lift<U>(value: U): MonoidArray<U> {
		return new MonoidArray([value])
	}
	lift<U>(value: U): MonoidArray<U> {
		return new MonoidArray([value])
	}
	append(other: MonoidArray<T>): MonoidArray<T> {
		return new MonoidArray(this.data.concat(other.data))
	}
	static klass<U>() {
		return this as any as MonoidArray<U>
	}
}
class StaticMonoidArray {
	zero: <U>() => MonoidArray<U>;
	lift: <U>(value: U) => MonoidArray<U>;
}


// var StaticMonoidArray = {
// 	// new: <T>(value: T) => (new MonoidArray<T>([value])),
// 	zero: function<U>(): MonoidArray<U> {
// 		return new MonoidArray<U>([])
// 	},
// 	lift: function<U>(value: U): MonoidArray<U> {
// 		return new MonoidArray([value])
// 	}
// }
// class StaticMonoidArray<T> implements Static_for_IMonoid<T, MonoidArray<T>> {
// 	// new: (value: T) => (new MonoidArray<T>([value]));
	
// 	// new (value: T): MonoidArray<T> {
// 	// 	return new MonoidArray<T>([value]);
// 	// }
// 	// new = (value: T) => (new MonoidArray<T>([value]));
// 	zero = MonoidArray.zero;
// 	lift = MonoidArray.lift;
// }




class FoldableArray<T> implements ITransformable<T> {
	constructor(public data: Array<T>){}
	fold<U>(f: (first: U, second: T) => U, initial: U): U {
		return this.data.reduce<U>(f, initial);
	}
	// transformTo(monoidClass: new (value: T) => IMonoid<T>): IMonoid<T> {
	// transformTo<MInstance extends IMonoid<T>, MClass extends IMonoidStatic<T>>(monoidClass: MClass) {
	// transformTo<IM extends IMonoid<T>>(monoidClass: Static_for_IMonoid<T, IM>): IM {
	// transformTo<IM extends Monoid<T>>(monoidClass: {new(x: any): IM, lift<U>(x: U): Monoid<U>, zero<U>(x: U): Monoid<U>}): IM {
	
	// transformTo<MC extends Monoid<T>>(monoidClass: MC) {
	transformTo<MStatic extends StaticMonoid, MInstance extends Monoid<T>>(monoidClass: MStatic) {
		/*
		REMAINING WEAKNESS: that *both* of MStatic and MInstance have to be passed in
		explicitly. It seems like one should be inferable from the other....
		 */
		let result = this.fold<MInstance>(
			(accumulator, x) => accumulator.append(monoidClass.lift<T>(x)) as MInstance,
			monoidClass.zero<T>() as MInstance
		);
		return result;

		// function (accumulator: IMonoid<T>, elm: T): IMonoid<T> {
		// 	return accumulator.append(monoidClass.lift<T>(elm))
		// },
	}
	clever<MInstance extends Monoid<T>>(monoidClass: MInstance) {
		return this.fold<MInstance>(
			(accumulator, x) => accumulator.append(monoidClass.lift<T>(x)) as MInstance,
			monoidClass.zero<T>() as MInstance
		);
	}
}

var foldable = new FoldableArray([4, 6, 9]);
var result = foldable.transformTo<StaticMonoidArray, MonoidArray<number>>(MonoidArray);
result
var rz  = foldable.clever(MonoidArray.zero<string>()); rz