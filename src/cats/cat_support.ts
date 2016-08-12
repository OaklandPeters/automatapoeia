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
type Native = Primitive | NativeClasses;

// Primitive data types in Javascript, besides object.
// These are things which may need to be handled different than
// standard 'class' objects.
// All of these have a unique return value from 'typeof'
type Primitive = string | number | boolean | symbol | Function;

// Non-Primitive data structures builtin to ES6-era Javascript
// These all have typeof === 'object'
type NativeClasses = NativeMisc | NativeIndexedCollections | NativeKeyedCollections;

type NativeMisc = (Date | JSON | RegExp | Error);

type NativeIndexedCollections = (
	Array<any> | Int8Array | Uint8Array | Uint8ClampedArray
	| Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array
	| Float64Array
);

type NativeKeyedCollections = (
	Map<any, any> | WeakMap<any, any>
	| Set<any> | WeakSet<any>
);

 
/* Utility Types for TypeScript
=============================== */
// Class<T> is used to refer to construction functions for a given class
type Class<T> = {new(...values: Array<any>): T};

/* Assertions
===================================== */
class Exception implements Error {
	/* Concrete implementation of the builtin Error interface */
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
type TestResultKind = "pass" | "fail" | "error";

interface ITestMethodSummary {
	name: string,
	passed: boolean,
	kind: TestResultKind,
	message?: string,
	stack?: string
}

interface ITestLog extends Array<ITestMethodSummary> {}



class TestMethodSummary {
	constructor(
		public name: string,
		public passed: boolean,
		public kind: TestResultKind,
		public message?: string,
		public stack?: string
	) {}
	// toString(): string {}
}


class UnitTests {
	/*
	random: A function that generates random instances of class T

	@todo: refactor this into UnitTest, and LawTests which extends it
	@todo: Give a better type to the TestLog
	*/
	log: ITestLog;
	constructor() {
		this.log = [];
	}
	runMethod(name: string): ITestMethodSummary {
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
			return this.declareSuccess(name);
		} else {
			return this.declareException(name, exception);
		}
	}
	run(names: Array<string>): ITestLog {
		for (name of names) {
			
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
	declareException(methodName: string, exception: Exception | AssertionException) {
		if (AssertionException.is(exception)) {
			return this.declareFail(name, exception);
		} else {
			return this.declareError(name, exception);
		}
	}
	declareFail(methodName: string, exception: AssertionException) {
		this.log.push(['Fail', methodName, exception.name, exception.message]);
	}
	declareError(methodName: string, error: Error) {
		this.log.push(['Error', methodName, error.name, error.message]);
	}
	declareSuccess(methodName: string) {
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
	Native, Primitive, NativeClasses,
	NativeMisc, NativeIndexedCollections, NativeKeyedCollections,
	Class,
	assertType, assert, Exception, AssertionException,
	TestLog, UnitTests, LawTests
}
