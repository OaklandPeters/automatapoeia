function flatten()
function flatten<T, U extends Monoid<T | IJoinable<T>>>(joinable: U): IJoinable<T> {
	return reduce<T, IJoinable<T>>(
		joinable,
		function(accumulator: IJoinable<T>, element: T | IJoinable<T>): IJoinable<T> {
			if (Joinable.is<T>(element)) {
				return append(accumulator, element)
			} else {
				return append(accumulator, lift(accumulator, element))
			}
		}
	)
}
