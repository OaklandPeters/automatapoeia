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

function assertType<T>(value: any, predicate: (x: any) => boolean): value is T {
	/* Use this as an ad-hoc type-gaurd. Especially useful for checking built-in types
	without defining a huge number of custom functions. Ex.
		if (assertType<string>(x, (x) => (typeof x === 'string') )) {
	*/
	return predicate(value)
}


export {
	Builtin, Primitive,
	Native, NativeMisc, NativeIndexedCollections, NativeKeyedCollections,
	Class, assertType
}
