import {Fragment} from "./fragment";
import {TypeOrFunction} from "./type";

export type FragmentsContainerEntry = Fragment | FragmentsContainer | string;

export type FragmentsList = Array<FragmentsContainerEntry>;


export interface FragmentsContainer
{
	tree(): FragmentsList
}

export interface SeparatedFragmentsContainer extends FragmentsContainer
{
	separator: TypeOrFunction<string>
}

export class SimpleFragmentsContainer implements SeparatedFragmentsContainer
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

export class ThroughLineContainer extends SimpleFragmentsContainer
{
	constructor()
	{
		super("\r\n");
	}
}

export class LineFragmentsContainer extends SimpleFragmentsContainer
{
	constructor()
	{
		super("");
	}
}