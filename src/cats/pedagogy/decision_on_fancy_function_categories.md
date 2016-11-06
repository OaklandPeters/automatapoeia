
Rethinking Decisions
==========================
I'm considering not using the function-based line of categories: Invokeable, Morphism, Composable, Category, parts of Functor
The idea is to side-step needing objects that are 'fancy-functions', and just rely on vanilla functions with the right type-signature.

Conclusion
------------------------------------------
[this should logically occur AFTER the arguments, but since I've made my decision, I'm putting it first]
I'm keeping function-categories/function-objects because point Argument-For (1) is very convincing


Arguments for Using Function-Categories
------------------------------------------
(1) There are some meta-function operations that need to be overloaded for some categories (compose, etc). So, I'll need some way to essentially dispatch on the type of a function - and there is no way to do this in Javascript/Typescript without building something like function-objects.
(2) They are heavily used in Haskell, and if I want to match Haskell's structure, I'll need them
(2.1) Note - Haskell is basically my only reference point for much of this work, so if I change this part of the "structure" then doing any comparison to Haskell will require an additional 'translation' step.


Arguments agsinst function-categories
-------------------------------------------
(1) Lower cognitive load
(2) Faster build time
(3) Easier to get people to accept
(4) I still don't know why I need F<a -> b> instead of F<a> -> F<b>
(4.1) Realization: maybe the ability to overload-functions/dispatch-on-functions, based on the function signature (basically, the category the function is in). Examples - any metafunction which doesn't have a 'non-function' argument, such as compose, or basically anything dealing with Arrows. There isn't really a way to do this in Javascript/Typescript without creating a special function-object sort of thing.


