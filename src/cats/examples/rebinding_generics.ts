/**
 * The idea here is to be able to have a function that takes a generic,
 * and to change or assign to its inner type.
 */

//
//TESTING IIFS to kludge HKTypes
//
interface Free<T> {
	get: () => T;
	set: (value: T) => void;
	// new: (value: T) => this;
	make: <U>(value: U) => Free<U>;
} declare var Free: {
	lift: <U>(value: U) => Free<U>;
}
abstract class FreeABC<T> implements Free<T> {
	abstract get(): T;
	abstract set(value: T): void;
	abstract make<U>(value: U): FreeABC<U>;
	static lift: <U>(value: U) => FreeABC<U>;

}
interface Freeish {
	// Non-generic version of Free
	get: () => any;
	set: (value: any) => void;
}
// class MyGeneric<T> implements Free<T> {
class MyGeneric<T> extends FreeABC<T> {
	data: T;
	constructor(value: T) {
		this.data = value;
		super();
	}
	get(): T {
		return this.data;
	}
	set(value: T): void {
		this.data = value;
	}
	make<U>(value: U): MyGeneric<U> {
		return new MyGeneric(value);
	}
	static lift<U>(value: U): MyGeneric<U> {
		return new MyGeneric<U>(value);
	}
}


function makeFreeGeneric<CurrentInner, NewInner, CurrentGenericInstance extends Free<CurrentInner>>(
			container: CurrentGenericInstance,
			newInner: NewInner) {
	/**
	 * 
	 * @todo: document this trick in its own file
	 * @todo: Try to combine this with IIFS, to see if that combo can infer Generic<NewInner>
	 */
	var newContainer = container.make<NewInner>(newInner);
	newContainer; // newContainer - new inferred to be Free<NewInner>
	return newContainer;
}


var myGenericString = new MyGeneric<string>("blah");
var theInferenceWeWant = myGenericString.make(12);
theInferenceWeWant;	 // theInferenceWeWant - is MyGeneric<number>

var theLiftedInference = MyGeneric.lift(12);
theLiftedInference; // theLiftedInference - is MyGeneric<number>

var inferenceResult = makeFreeGeneric<string, number, MyGeneric<string>>(
	myGenericString, 12);
inferenceResult; // inferenceResult - is inferred to be Free<number>
				 //     So, it gets the inner type correct, but not the outer type    
var correctlyCasted = inferenceResult as typeof theInferenceWeWant;
correctlyCasted;   // correctlyCasted - CORRECTLY inferred to be MyGeneric<number>


//
//	-------- THE NEW IDEA
// Since I can call myGenericString.make(12) OR myGeneric.lift(12),
// and both yield the type I want
//   Try an IFFE to generic this outside of the call to makeFreeGeneric, and cast the result
//
// ... actually, I don't have to do an IIFE
//
// SO, the remaining question is - can I get a function or IIFE to do this for me

function canIMakeItViaFunction<CI, GC extends Free<CI>>(
	genericContainer: GC) {
	var rebound = genericContainer.make<number>(12);
	return rebound;
}

var v1 = canIMakeItViaFunction(myGenericString);
v1;

// I MIGHT need to set the return type to some bounded generic
var canIMakeItViaIIFE = (function(){
	var genericContainer = myGenericString;

	var rebound = genericContainer.make(12);
	var casted = makeFreeGeneric<string, number, MyGeneric<string>>(
		myGenericString, 12) as typeof rebound;
	return casted;
})();
canIMakeItViaIIFE;  // - MyGeneric<number>
					// This is correct, but I'm cheating by not passing in myGenericString
					// So... I still can't find a way to pass in an F-bounded type variable,
					// And re-bind it via a function, inside a closure.
					// Lessons:
					// (1) TS CAN rebind a generic, but only using the boundary class
					// (2) TS CAN NOT rebind a generic, dynamically replacing the bounded class

// The goal here is to try to trick TS into letting me pass the actual value of the
// generic, at least one level deep - then do the casting there
var canIMakeItViaNestedIIFE = (function<GC extends Free<any>, GKlass extends {lift: <U>(value: U)=>Free<U>}, U, CleverInstance extends Free<U>, GClever extends {lift: <U>(value: U)=>CleverInstance}>(
	genericInstance: GC, GenericClass: GKlass, cleverInstance: CleverInstance, CleverClass: GClever){
	var layer1 = (function(){
		return genericInstance
	})();
	// layer1::GC extends Free<any> infers to MyGeneric<string>
	// return layer1; 

	var remade = layer1.make(12);
	// return remade as any as GKlass // remade::Free<number> infers 'typeof MyGeneric'
	var binding = GenericClass.lift(12);
	// return binding //binding::Free<number> infers to Free<number>

	var bindingCast = binding as typeof layer1;
	// return bindingCast;  //bindingCast::GC extends Free<any> infers to MyGeneric<string>


	


})(myGenericString, MyGeneric, myGenericString, MyGeneric);
canIMakeItViaNestedIIFE; // 


var canIMakeItViaIIFEWithFunctionTrick = (<U>(value: U): MyGeneric<U> => {

}); // Add parameters here
var functionTrickResult = canIMakeItViaIIFEWithFunctionTrick(12);



// 
// var instance = ((Container, Inner): Free => {
// 	var thing: any = new Container
// })(MyGeneric, Number); // Add parameters here

