/**
 * Things cut out of morphism.ts, or early prototypes I've decided against.
 */

// We cannot define a normal Morphism class or abstract class, and have
// it act as a normal function.
// BUT - we can define a factory function which will define something that
// behaves the same way
let Morphism = {
	create: function createMorphism<A, B, T extends IInvokable<A, B>>(invokable: T): IMorphism<T, A, B> {
		/**
	     * We have two related objects.
	     * invokable - an object in JS terms.
	     *     This cannot be directly called via normal Javascript, although its methods can
	     * morphism - constructed by this function.
	     * 	   Usable as a normal Javascript function, but also has access to all attributes
	     * 	   and methods of the 'invokable' object.
	     *
	     * This plays the role of a constructor for Morphism classes.
	     */
		function f(arg: A): B {
			return this.invoke(arg);
		}
		let bound = f.bind(invokable);
		bound.__proto__ = (invokable as any).__proto__;
		return updateObject<Function, T>(bound, invokable) as IMorphism<T, A, B>;
	},
	is: function isMorphism<T, Input, Output>(value: any): value is IMorphism<T, Input, Output> {
		/**
		 * Since we cannot define an abstract base class for Morphism, this function
		 * plays the role of Morphism.is
		 */
		return isMorphism<T, Input, Output>(value);
	}
};
