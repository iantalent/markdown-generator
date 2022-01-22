import {
	FragmentsContainer,
	FragmentsContainerEntry,
	SeparatedFragmentsContainer,
	SimpleFragmentsContainer
} from "./container";
import {getTypeOrFunctionValue} from "./type";
import {Page} from "./page";
import {BlockLevelFragment, Fragment, FragmentContent, LinePrefixFragment} from "./fragment";

export function isFragmentsContainer(container: any): container is FragmentsContainer
{
	return typeof container['tree'] === 'function';
}

export function isSeparatedFragmentsContainer(container: any): container is SeparatedFragmentsContainer
{
	return ['string', 'function'].indexOf(typeof container['separator']) !== -1 && isFragmentsContainer(container);
}

export function isPage(page: any): page is Page
{
	return typeof page['path'] === 'function' &&
		typeof page['frontmatter'] === 'function' &&
		isFragmentsContainer(page);
}

export function isFragment(fragment: any): fragment is Fragment
{
	return ['string', 'function'].indexOf(typeof fragment['content']) !== -1 ||
		Array.isArray(fragment['content'])
		|| isFragment(fragment['content']);
}

function isBlockLevelFragment(fragment: any): fragment is BlockLevelFragment
{
	return ['boolean', 'function'].indexOf(typeof fragment['blockLevel']) !== -1 && isFragment(fragment);
}

function isLinePrefixFragment(fragment: any): fragment is LinePrefixFragment
{
	return ['string', 'function'].indexOf(typeof fragment['linePrefix']) !== -1 && isFragment(fragment);
}

function createContainerFromArray(array: Array<FragmentsContainerEntry>): FragmentsContainer
{
	return {
		tree: () => array
	}
}

type BuildMarkdownState = {
	/**
	 * is firstFragment fragment processing ?
	 */
	firstFragment: boolean
	/**
	 * is blank line required ?
	 */
	needBlankLine: boolean,
	/**
	 * current prefixes
	 */
	linePrefixes: Array<string>
}

function processFragmentArrayContent(contentArray: Array<FragmentContent>, state: BuildMarkdownState): string
{
	const parts: Array<string> = [];
	for(const contentItem of contentArray)
	{
		if(typeof contentItem === 'string')
			parts.push(contentItem);
		else if(Array.isArray(contentItem))
			parts.push(processFragmentArrayContent(contentItem, state));
		else if(isFragment(contentItem))
			parts.push(processFragmentContent(contentItem, state));
	}
	return parts.join('');
}

function processFragmentContent(fragment: Fragment, state: BuildMarkdownState): string
{
	const content = getTypeOrFunctionValue(fragment.content, fragment);
	
	if(typeof content === 'string')
		return content;
	
	if(Array.isArray(content))
		return processFragmentArrayContent(content, state);
	
	if(isFragment(content))
		return processFragmentContent(content, state);
	
	throw new Error('Fragment content can be only string, fragment or Array of strings or fragments');
}

function buildMarkdownContainer(container: FragmentsContainer | Page | Array<FragmentsContainerEntry>, state: BuildMarkdownState): string
{
	let separator = isSeparatedFragmentsContainer(container) ?
		getTypeOrFunctionValue(container.separator, container) : '';
	
	if(Array.isArray(container))
		container = createContainerFromArray(container);
	
	return container.tree().map(entry =>
	{
		if(typeof entry === 'string')
			return entry;
		else if(Array.isArray(entry))
			return buildMarkdownContainer((new SimpleFragmentsContainer()).add(entry), state);
		else if(isFragmentsContainer(entry)) //FragmentsContainer
			return buildMarkdownContainer(entry, state);
		else if(isFragment(entry))
		{
			const isBlockLevel = isBlockLevelFragment(entry) && getTypeOrFunctionValue(entry.blockLevel, entry),
				before = !state.firstFragment && (isBlockLevel || state.needBlankLine) ? '\r\n\r\n' : '',
				isLinePrefix = isLinePrefixFragment(entry);
			
			state.firstFragment = false;
			state.needBlankLine = isBlockLevel;
			
			if(isLinePrefix)
				state.linePrefixes.push(getTypeOrFunctionValue(entry.linePrefix, entry));
			
			const result = before + processFragmentContent(entry, state);
			
			if(isLinePrefix)
				state.linePrefixes.pop();
			
			return result;
		}
		else
			throw new Error('There is wrong item in container. Allowed only Fragment, FragmentsContainer, string. Got ' + typeof entry);
		
	}).filter(value => value).join(separator)
}

/**
 * @param {FragmentsContainer|Page} container
 * @returns {string}
 */
export function buildMarkdown(container: FragmentsContainer | Page | Array<FragmentsContainerEntry>): string
{
	return buildMarkdownContainer(container, {
		firstFragment: true,
		needBlankLine: false,
		linePrefixes: []
	});
}
