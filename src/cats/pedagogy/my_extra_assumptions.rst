Uncommon Extra Assumptions I Make
====================================
I presume the existance of a few functions on any category I want to work with.
This is for practical concerns, and they are often ignored by authors working in the realm of pure-mathematics, 



Equatable: 'equal(a, b)'
--------------------------
Without the ability to confirm the equivalence of two objects in a category, many (most) laws can't be confirmed. In implementing categories in a programming langauge, we need the ability to confirm that our work actually obeys the laws we think it does. 
	Further many laws concern the equivalence of two constructed functions (morphisms), for example:
	compose(F1, compose(F2, F3)) == compose(compose(F1, F2), F3)
But - in almost any programming context, it's all-but-impossible to prove the equivalence of two functions. BUT - we can confirm the equivalence of their behavior on real data in the form of unit-tests... assuming that the data is equatable.

Callable: 'call(F::(A->B), a)'
---------------------------------
This is simply the statement that we can actually evaluate a morphism in the category on one of the objects in that category (assuming the types line-up). Basically any useful concrete category will have be callable morphisms, and testing is a pain without it.

Haskell cares about non-Callable categories (see the Side-note below), but I do not (in this project).

Side-note: there *are* actual real world relevant categories which we might build, which are not directly Callable. For example - some foreign language interfaces. Consider a monadic Javascript library which is used to write C functions. The library might be able to translate (some) Javascript functions into C functions, and even compose them, but (likely) would not be able to compile and execute them. However - it COULD compose the functions, then pass the code off to a C compiler.
