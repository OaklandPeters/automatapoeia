/* CREATE: Liftable, then Mappable - with a 'map' operation:
function map<C, T, U>(enumerable: Enumerable<C, T> & Liftable<T> & Appendable<T>)


*/
function map<C, T, U>(enumerable: Enumerable<C, T>, f: ()): {
	// Map actually requires a lift() operation
	// So: 
}

