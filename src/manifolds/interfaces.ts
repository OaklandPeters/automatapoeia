import {Buildable, assertType} from '../support';
import {RecursiveArray, isRecursiveArray, traverseArray, isArray, flattenArray} from '../support';

import {Manifold} from './base';


export interface ICoordinate extends Array<number> {
	dimension: number;
}

// export type folderType<T, U, C> = (accumulator: U,
// 							element: T | RecursiveArray<T>,
// 							path: Array<number>,
// 							thisContainer?: C) => U;

export interface IManifold<C extends ICoordinate, T> {
	/*
	
		get
		set
		delete

		getLeaf
		setLeaf
		getStem
		setStem

		data

		append
		_append
		toArray
	 */
	// data: RecursiveArray<T>;

	dimension: number;

	/* Accessors */
	// get(coordinate: C): T | ISubManifold<C, T>;
	// set(coordinate: C, cell: T | RecursiveArray<T>): void;
	// delete(coordinate: C): void;

	getLeaf(coordinate: C): T;
	setLeaf(coordinate: C, value: T): void;

	getStem(coordinate: C): ISubManifold<C, T>;
	setStem(coordinate: C, value: IManifold<C, T>): void;

	getRoot(): IManifold<C, T>;
	setRoot(value: IManifold<C, T>): void;


	// fold<U>(f: folderType<T, U, Manifold<T>>, initial:U, initialPath?: Array<number>): U;
	// _fold<U>(f: folderType<T, U, RecursiveArray<T>>, initial: U, initialPath?: Array<number>): U;
	fold<U>(f: (accumulator: U,
				 element: T | RecursiveArray<T>,
				 path: Array<number>,
				 thisManifold?: IManifold<T>
				 ) => U,
			 initial: U,
			 initial_path?: Array<number>
	): U;
	_fold<U>(f: (accumulator: U,
				 element: T | RecursiveArray<T>,
				 path: Array<number>,
				 thisArray?: RecursiveArray<T>
				 ) => U,
			 initial: U,
			 initial_path?: Array<number>
	): U;

	append(other: Manifold<T>): IManifold<T>;
	_append(other: RecursiveArray<T>): IManifold<T>;
	
	toArray(): RecursiveArray<T>;
	coordinate(values: Array<number>): ICoordinate;
	subManifold(coordinate: Coordinate): ISubManifold<C, T>;
	lift<U>(data: RecursiveArray<U>): IManifold<U> 
	zero<U>(): IManifold<U>;


	/* Group-theoretic
	------------------------- */
	//fold, reduce, append, join

	/* Functional
	------------------ */
	// map, bind, traverse
}

export function isIManifold<C extends ICoordinate, T>(value: any): value is IManifold<C, T>  {
	/*
	... I really don't know what I should be checking here
	This would be a LOT cleaner with the utilties from type_check.ts:
		return StructuralCheck(value,
			{get: Function, set: Function, delete: Function,
			map: Function, bind: Function, traverse: Function})
	*/
	return (value.get !== undefined
			&& value.set !== undefined
			&& value.delete !== undefined)
}

export interface ISubManifold<C extends ICoordinate, T> extends IManifold<C, T> {
	/**
	 * A manifold embedded inside another manifold.
	 * Accessors here should proxy through to the parent.
	 *
	 * coordinate: coordiante to the start of this submanifold in the parent manifold
	 * 		(probably the lower-indexed corner)
	 *
	 * This should override these properties to proxy to the parent:
	 * 	get
	 * 	set
	 * 	delete
	 */
	parent: IManifold<C, T>;
	coordinate_in_parent: C;
	project(coordinate: C): IManifold<C, T>;
	updateParent(): void;
	// static is<C, T>(value: any): value is ISubManifold<C, T>;
}

