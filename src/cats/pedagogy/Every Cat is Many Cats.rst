Every Category is Many Categories
=======================================
Consider the category of lists ('List'). This is composed of (1) the set of all List-objects, (2) the set of List-morphisms defined on List-objects.

Because of the Category Axioms, we have some functions defined in relation to List-Morphisms - Compose and Identity. This means that List-morphisms themselves are a Monoid. Hence - this implied Monoid is ANOTHER category - defined with (1) the objects being List-morphisms, and (2) the morphisms being higher-order functions between List-morphisms. This is the '2-category' (https://en.wikipedia.org/wiki/2-category) on Lists.

You can repeat this implication process, to define a '3-category' on Lists, and a '4-category', and so on into increasingly abstract categories.

Consequences for My Studies
-----------------------------
Haskell often discusses Monads in the context of a 2-category, because they are easy to describe in that context. This is the basis for the plithy quote: "A monad is just a monoid in the category of endofunctors, what's the issue?"

However, my goal is to implement concrete categories and monads in common programming languages! So, I'm focused more on the 1-categories, and will seldom take the 2-category (or higher) PoV.

Unless I end up trying to implement Arrows... then I'll probably need to climb that tower of abstraction.
