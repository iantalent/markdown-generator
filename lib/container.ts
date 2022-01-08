import {Fragment} from "./fragment";
import {TypeOrFunction} from "./type";

export type FragmentsContainerEntry = Fragment | FragmentsContainer | string;

export type FragmentsList = Array<FragmentsContainerEntry>;


export interface FragmentsContainer
{
	tree(): FragmentsList
	
	separator: TypeOrFunction<string>
}

export class SimpleFragmentsContainer implements FragmentsContainer
{
	private readonly $fragments: FragmentsList = [];
	
	constructor(private readonly $separator: string = "")
	{
	}
	
	/**
	 *
	 * @param {Array<FragmentsContainerEntry>} fragments
	 * @returns {this}
	 */
	add(...fragments: Array<FragmentsContainerEntry>): this
	{
		if(fragments && fragments.length)
		{
			for(const fragment of fragments)
				this.$fragments.push(fragment);
		}
		return this;
	}
	
	tree(): FragmentsList
	{
		return this.$fragments;
	}
	
	separator()
	{
		return this.$separator;
	}
}

export class RootContainer extends SimpleFragmentsContainer
{
	constructor()
	{
		super("\r\n");
	}
}

export class InlineFragmentsContainer extends SimpleFragmentsContainer
{
	constructor()
	{
		super("");
	}
}