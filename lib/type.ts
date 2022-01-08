export type TypeOrFunction<T> = T | (() => T);

function isFunction(functionPretender: any): functionPretender is Function
{
	return functionPretender instanceof Function;
}

export function getTypeOrFunctionValue<T>(value: TypeOrFunction<T>): T
{
	return isFunction(value) ? value() : value;
}