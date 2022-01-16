export type TypeOrFunction<T> = T | (() => T);

export function getTypeOrFunctionValue<T>(value: TypeOrFunction<T>, thisArg?: any): T
{
	return value instanceof Function ? value.apply(thisArg) : value;
}