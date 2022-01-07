import {isFragmentsContainer} from "./utils";

export type FragmentContent = (() => string) | string;

export type FragmentsContainerEntry = Fragment | FragmentsContainer | string;

export type FragmentsList = Array<FragmentsContainerEntry>;

export interface Fragment
{
	content: FragmentContent
}

export class SimpleFragment implements Fragment
{
	constructor(private readonly $content: string)
	{
	}
	
	content()
	{
		return this.$content
	};
}

export interface FragmentsContainer
{
	tree(): FragmentsList
}

export class SimpleFragmentsContainer implements FragmentsContainer
{
	private readonly $fragments: FragmentsList = [];
	
	/**
	 *
	 * @param {FragmentsContainerEntry} fragment
	 * @returns {this}
	 */
	add(fragment: FragmentsContainerEntry)
	{
		this.$fragments.push(fragment);
		return this;
	}
	
	tree(): FragmentsList
	{
		return this.$fragments;
	}
}



/**
 * @param {FragmentsContainer} container
 * @param {string} separator
 * @returns {string}
 */
export function buildMarkdown(container: FragmentsContainer, separator: string = '\n\r'): string
{
	return container.tree().map(entry =>
	{
		if(typeof entry === 'string')
			return entry;
		else if(Array.isArray(entry))
			return buildMarkdown((new SimpleFragmentsContainer()).add(entry), separator);
		else if(isFragmentsContainer(entry)) //FragmentsContainer
			return buildMarkdown(entry, separator);
		else if(entry['content'])
		{
			if(typeof entry['content'] === 'function')
				return entry.content();
			
			if(typeof entry['content'] === 'string')
				return entry.content;
			
			throw new Error('There is wrong content type in SimpleFragment. Allowed only function and string. Got ' + typeof entry['content']);
		}
		else
			throw new Error('There is wrong item in container. Allowed only Fragment, FragmentsContainer, string');
	}).filter(value => value).join(separator)
}
