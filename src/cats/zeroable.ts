function isTruthy(value: any): boolean {
	/*
	Zeroable defines a more rigorous notion of 'False'/'Empty'
	.... but I don't have Zeroable written yet. */
	// if (Zeroable.is<any>(value)) {
	// 	return (value === value.zero())
	// } else {
	// 	return Boolean(value)
	// }
	return Boolean(value)
}


export {
	isTruthy
}