import {Page} from "./page";
import {FragmentsContainer, InlineFragmentsContainer, SimpleFragmentsContainer} from "./container";
import {getTypeOrFunctionValue} from "./type";

export function isFragmentsContainer(pretender: any): pretender is FragmentsContainer
{
	return typeof pretender['tree'] === 'function';
}

export function isPage(pretender: any): pretender is Page
{
	return typeof pretender['path'] === 'function' &&
		typeof pretender['frontmatter'] === 'function' &&
		isFragmentsContainer(pretender);
}


/**
 * @param {FragmentsContainer} container
 * @returns {string}
 */
export function buildMarkdown(container: FragmentsContainer): string
{
	return container.tree().map(entry =>
	{
		if(typeof entry === 'string')
			return entry;
		else if(Array.isArray(entry))
			return buildMarkdown((new SimpleFragmentsContainer()).add(entry));
		else if(isFragmentsContainer(entry)) //FragmentsContainer
			return buildMarkdown(entry);
		else if(entry['content'])
			return getTypeOrFunctionValue(entry.content);
		else
			throw new Error('There is wrong item in container. Allowed only Fragment, FragmentsContainer, string');
	}).filter(value => value).join(getTypeOrFunctionValue(container.separator))
}
