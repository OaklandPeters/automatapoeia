/*
Using Class Types in Generics

This is a Type-Script specific example.

When you need to pass a class in as a parameter, you have to refer to that
class type by its constructor functions. For example, see 'create' below.

This is relevant for categories with requirements on the constructors they express,
which includes Liftable, Zeroable, Functors, and Traversable.



A more advanced example uses the prototype property to infer and constrain relationships between the constructor function and the instance side of class types.

class BeeKeeper {
    hasMask: boolean;
}

class ZooKeeper {
    nametag: string;
}

class Animal {
    numLegs: number;
}

class Bee extends Animal {
    keeper: BeeKeeper;
}

class Lion extends Animal {
    keeper: ZooKeeper;
}

function findKeeper<A extends Animal, K> (a: {new(): A;
    prototype: {keeper: K}}): K {

    return a.prototype.keeper;
}

findKeeper(Lion).nametag;  // typechecks!


====================================
I might be able to use this property
to produce higher-kinded structures.
====================================
*/




function create<T>(c: {new(): T; }): T {
    return new c();
}





// In this light:
// 
interface Liftable<T> {
	new: (x: T) => Liftable<T>;
	lift: <U>(x: U) => Liftable<U>;
}

function lift<T extends Liftable<U>, U>(klass: {new(x: U): T, lift(x:U): T}, x: U): T {
	return klass.lift(x)
}