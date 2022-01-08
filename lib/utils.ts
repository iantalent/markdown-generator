import {Page} from "./page";
import {FragmentsContainer, InlineFragmentsContainer, SimpleFragmentsContainer} from "./container";

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
 * @param {string} separator
 * @returns {string}
 */
export function buildMarkdown(container: FragmentsContainer, separator: string = "\r\n"): string
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
	}).filter(value => value).join(container instanceof InlineFragmentsContainer ? '' : separator)
}
