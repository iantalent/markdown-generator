import {Fragment} from "./fragment";

export type FragmentsContainerEntry = Fragment | FragmentsContainer | string;

export type FragmentsList = Array<FragmentsContainerEntry>;


export interface FragmentsContainer
{
	tree(): FragmentsList
}

export class SimpleFragmentsContainer implements FragmentsContainer
{
	private readonly $fragments: FragmentsList = [];
	
	/**
	 *
	 * @param {FragmentsContainerEntry[]} fragments
	 * @returns {this}
	 */
	add(...fragments: Array<FragmentsContainerEntry>)
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
}

export class InlineFragmentsContainer extends SimpleFragmentsContainer
{
}