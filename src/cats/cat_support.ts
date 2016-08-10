/*


Built-In and Native Data-Types
---------------------
I'm not considering low-level data types, such as DataView, ArrayBuffer, etc
I'm also not considering the HTML/CSS/Document/Window/Xpath related classes
Because there are WAY too many of them (100s)

None of these "Built-in" types include 'Object', because *almost* *everything*
counts as an object, so 'Object' ~ 'Any'
*/

/* Javascript Built-in Types
================================== */
// None of these in
type Builtin = Primitive | Native;

// Primitive data types in Javascript, besides object.
// These are things which may need to be handled different than
// standard 'class' objects.
// All of these have a unique return value from 'typeof'
type Primitive = string | number | boolean | symbol | Function;

// Non-Primitive data structures builtin to ES6-era Javascript
// These all have typeof === object
type Native = NativeMisc | NativeIndexedCollections | NativeKeyedCollections;
// type Native = (Array<any> | Date | Map<any, any> | WeakMap<any, any>
// 	| Set<any> | WeakSet<any> | JSON | RegExp | Error);

type NativeMisc = (Date | JSON | RegExp | Error);

type NativeIndexedCollections = (Array<any> | Int8Array | Uint8Array | Uint8ClampedArray
	| Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array
	| Float64Array);

type NativeKeyedCollections = (Map<any, any> | WeakMap<any, any>
	| Set<any> | WeakSet<any>);

 
/* Utility Types for TypeScript
=============================== */
// Class<T> is used to refer to construction functions for a given class
type Class<T> = {new(...values: Array<any>): T};

/* Assertions
===================================== */
interface IException {
    name: string;
    message: string;
    stack: string|void;
}

class Exception implements IException {
	constructor(
		public name: string,
		public message?: string,
		public stack?: string) {
	}
}

class AssertionException extends Exception {
	constructor(message?: string, stack?: string) {
		let msg = (typeof message === 'undefined') ? "Assertion untrue" : message;
		super("AssertionException", msg, stack);
	}
	static is(value: any): value is AssertionException {
		if (value.name instanceof String) {
			if (value.name.toLowerCase().startsWith('assertion')) {
				return true;
			}
		}
		return false
	}
}

function assert(value: boolean | (() => boolean), message?: string): boolean {
	let truth = (typeof value === 'function') ? value() : value;
	if (truth === false) {
		throw new AssertionException(message);
	} else {
		return truth;
	}
}

function assertType<T>(value: any, predicate: (x: any) => boolean): value is T {
	/* Use this as an ad-hoc type-gaurd. Especially useful for checking built-in types
	without defining a huge number of custom functions. Ex.
		if (assertType<string>(x, (x) => (typeof x === 'string') )) {
	*/
	return assert(() => predicate(value))
}

/* Law-based unit-testing utility
===================================== */
interface TestLog extends Array<[any]> {}

class UnitTests {
	/*
	random: A function that generates random instances of class T

	@todo: refactor this into UnitTest, and LawTests which extends it
	@todo: Give a better type to the TestLog
	*/
	log: TestLog;
	constructor() {
		this.log = [];
	}
	run(names: Array<string>): TestLog {
		for (name of names) {
			let method = (this as any)[name];
			// Execute the test methods - catching assertion errors
			let passed = true;
			let exception: Error;
			try {
				method();
			} catch (err) {
				passed = false;
				exception = err;
			}
			if (passed) {
				this.recordSuccess(name);
			} else {
				this.recordException(name, exception);
			}
		}
		return this.log;
	}
	runAll() {
		let methodNames: Array<string> = [];
		for (let key in this) {
			if (key.startsWith('test')) {
				methodNames.push(key);
			}
		}
		return this.run(methodNames);
	}
	recordException(methodName: string, exception: Error | AssertionException) {
		if (AssertionException.is(exception)) {
			return this.recordFail(name, exception);
		} else {
			return this.recordError(name, exception);
		}
	}
	recordFail(methodName: string, error: AssertionException) {
		this.log.push(['Fail', methodName, error.name, error.message]);
	}
	recordError(methodName: string, error: Error) {
		this.log.push(['Error', methodName, error.name, error.message]);
	}
	recordSuccess(methodName: string) {
		this.log.push(['Success', methodName]);
	}
}

class LawTests<Klass> extends UnitTests {
	constructor(
		public klass: {new: (values: Array<any>) => Klass},
		public random: (seed: number) => Klass,
		public seed: number = 0
	) {
		super();
	}
}


export {
	Builtin, Primitive,
	Native, NativeMisc, NativeIndexedCollections, NativeKeyedCollections,
	Class, assertType, assert,
	Exception, AssertionException,
	LawTests
}
