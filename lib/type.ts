export type TypeOrFunction<T> = T | (() => T);

export function getTypeOrFunctionValue<T>(value: TypeOrFunction<T>): T
{
	return value instanceof Function ? value() : value;
}