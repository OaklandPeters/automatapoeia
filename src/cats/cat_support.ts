function isEqual(left: any, right: any): boolean {
	if (left.equal instanceof Function) {
		return left.equal(right)
	} else if (right.equal instanceof Function) {
		return right.equal(left)
	} else {
		return (left === right)
	}
}

export {
	isEqual
}
