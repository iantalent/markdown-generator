import {FragmentsContainer, SimpleFragmentsContainer} from "./container";
import {getTypeOrFunctionValue} from "./type";
import {Page} from "./page";

export function isFragmentsContainer(pretender: any): pretender is FragmentsContainer
{
	return typeof pretender['tree'] === 'function' && ['string', 'function'].indexOf(typeof pretender['separator']) !== -1;
}

export function isPage(pretender: any): pretender is Page
{
	return typeof pretender['path'] === 'function' &&
		typeof pretender['frontmatter'] === 'function' &&
		typeof pretender['tree'] === 'function';
}

/**
 * @param {FragmentsContainer|Page} container
 * @returns {string}
 */
export function buildMarkdown(container: FragmentsContainer | Page): string
{
	if(isPage(container))
		container = container.tree();
	
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
