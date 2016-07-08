
//
//	Code for mixins
//
export interface Constructible<T> {
	/*  Constructible & Buildable are utility types, used to appease TypeScript
	when calling this.constructor from methods. */
	new (...args: any[]): T;
};

export type Buildable<T> = Constructible<T> & Function;


function applyMixins(derivedCtor: any, baseCtors: any[]): any {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
			if (name !== 'constructor') {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            }
        });
    });
}

// function MixinMethods<Min, Base extends Min, Mixin extends Min>(mixin: Constructible<Mixin>): Buildable<Mixin & Base> {
// 	return function (base: Constructible<Base>): Constructible<Mixin & Base> {
// 		return (applyMixins(base, [mixin])) as Constructible<Mixin & Base>;
// 	}
// }

// function MixinMethods2<Min, Base extends Min, Mixin extends Min>(mixin: Constructible<Mixin>): Constructible<Mixin & Base> {
// 	return function (base: Constructible<Base>): Constructible<Mixin & Base> {
// 		return (applyMixins(base, [mixin])) as Constructible<Mixin & Base>;
// 	}
// }

type Transformer<A, B> = (base: Constructible<A>) => Constructible<B>;

function MixinMethods2<Min, Base extends Min, Mixin>(mixin: Constructible<Mixin>): (base: Constructible<Base>) => Constructible<Mixin & Base> {
	return function (base: Constructible<Base>): Constructible<Mixin & Base> {
		return (applyMixins(base, [mixin])) as Constructible<Mixin & Base>;
	}
}


// ((Constructible<Base>): Constructible<Mixin & Base>)

// function MixinMethods2<Min, Base extends Min, Mixin extends Min>(mixin: Constructible<Mixin>, base: Constructible<Base>): Constructible<Mixin & Base> {
// 	return (applyMixins(base, [mixin])) as Constructible<Mixin & Base>;
// }




//
//	Testing
//
interface SequenceMin<C, T> {
	enumerate(): Array<[C, T]>;
	getitem(i: C): T;
	sizes(): Array<number>;
}

function _eq(left: any, right: any): boolean {
	return left === right
}

class SequenceMixin<C, T>  {
	// These are lies to placate TypeScript
	// abstract enumerate(): Array<[C, T]>;
	// abstract getitem(i: C): T;
	// abstract sizes(): Array<number>;

	// enumerate(): Array<[C, T]>;
	// getitem(i: C): T;
	// sizes(): Array<number>;


	// Better derivation sequence:
	// 		fold --> filter --> find/index --> count --> contains
	// Also:
	// 	    traverse --> enumerate
	index(x: T): Array<C> {
		return (this as any as SequenceMin<C, T>).enumerate().reduce(function(accumulator, [i, elm]){
			if (elm === x) {
				return accumulator.concat([i])
			}
			return accumulator
		}, [])
	}
	count(value: T, comparitor: (left: T, right: T) => boolean = _eq): number {
		return this.index(value).length;
	}
	contains(x: T): boolean {
		// This is inefficient, but making it more efficient requires the Iterator protocol.
		return this.count(x) > 0;
	}

}
// var people = [[0, 'John'], [1, 'Sarah'], [2, 'Oakland'], [3, 'John']]
// people.reduce(function(acc, pair){ if (pair[1] === ){ }; return acc}, 0)
export class PreList<T> implements SequenceMin<number, T> {
	constructor(
		protected data: Array<T>
	) { }

	enumerate(): Array<[number, T]> {
		return this.data.map((x: T, i: number) => [i, x]) as Array<[number, T]>
	}
	getitem(i: number): T {
		return this.data[i]
	}
	sizes(): Array<number> {
		return [this.data.length]
	}
}


export var List = function<T>(){
	return MixinMethods2<SequenceMin<number, T>, PreList<T>, SequenceMixin<number, T>>(SequenceMixin)(PreList)
}


var thing = new PreList([1, 2]);
thing.enumerate()