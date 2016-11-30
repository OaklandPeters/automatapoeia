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

/*  Constructible & Buildable are utility types, used to appease TypeScript
	when calling this.constructor from methods. */
interface Constructible<T> {
	new (...args: any[]): T;
};

interface Buildable<T> extends Constructible<T>, Function {
};


/* TypeScript related utility functions
=============================== */
function updateObject<T, U>(first: T, second: U): T & U {
	Object.keys(second).forEach(function(key){
		(first as any)[key] = (second as any)[key];
	});
	return first as T & U;
}


/* Assertions
===================================== */
class Exception implements Error {
	/* Concrete implementation of the builtin Error interface */
	constructor(
		public name: string,
		public message: string,
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

type TMSValue = string | boolean;
class TestMethodSummary implements ITestMethodSummary {
	/*
	var obj = {name: "test_stuff", passed: false, kind: "fail", message: "Totally didn't work"};
	format("TestMethodSummary\{{name}\}", obj)

	 */
	constructor(
		public name: string,
		public passed: boolean,
		public kind: TestResultKind,
		public message?: string,
		public stack?: string
	) {}
	items(): Array<[string, TMSValue]> {
		/* Return array of key/value pairs, including only those with a defined value */
		let _keys = ['name', 'passed', 'kind', 'message', 'stack'];
		let obj = this as {[key: string]: any}; // {[key: string]: string}
		let items = _keys
			.filter((key: string) => (obj[key] !== undefined))
			.map((key) => [key, (obj)[key]] as [string, TMSValue]);
		return items;
	}
	toString(): string {
		/*
		@todo: Consider using support.ts: format in this, or maybe making a conditionalFormat - which doesn't inject undefined

		var obj = {name: "test_stuff", passed: false, kind: "fail", message: "Totally didn't work"};
		 */
		let itemsString = this.items()
			.map((key, value) => (key + ": '" + String(value) + "'"))
			.join(", ");
		return "TestMethodSummary{" + itemsString + "}";
	}
	toArray(): Array<TMSValue> {
		return this
			.items()
			.map(([key, value]) => value);
	}
}


class UnitTests {
	/*
	random: A function that generates random instances of class T

	@todo: refactor this into UnitTest, and LawTests which extends it
	@todo: Give a better type to the TestLog
	@todo: Cover serialization of the log
	*/
	log: ITestLog;
	constructor() {
		this.log = [];
	}
	runMethod(name: string): ITestMethodSummary {
		let method = (this as any)[name];
		// Execute the test methods - catching assertion errors
		try {
			method();
		} catch (err) {
			return this.declareException(name, err as Exception);
		}
		return this.declareSuccess(name);
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
	declareException(methodName: string, exception: Exception | AssertionException): ITestMethodSummary {
		if (AssertionException.is(exception)) {
			return this.declareFail(name, exception);
		} else {
			return this.declareError(name, exception);
		}
	}
	declareFail(methodName: string, exception: AssertionException): ITestMethodSummary {
		let summary = new TestMethodSummary(methodName, false, "fail", exception.message, exception.stack);
		this.log.push(summary)
		return summary;
	}
	declareError(methodName: string, error: Error): ITestMethodSummary {
		let summary = new TestMethodSummary(methodName, false, "error", error.message, error.stack);
		this.log.push(summary);
		return summary
	}
	declareSuccess(methodName: string): ITestMethodSummary {
		let summary = new TestMethodSummary(methodName, true, 'pass');
		this.log.push(summary);
		return summary
	}
}

// -------------------------------
// Unfinished
// -------------------------------
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
	Class, Constructible, Buildable,
	updateObject,
	assertType, assert, Exception, AssertionException,
	TestResultKind, ITestMethodSummary, ITestLog, TestMethodSummary,
	UnitTests, LawTests
}
