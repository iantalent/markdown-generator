import {
	FragmentsContainer,
	FragmentsContainerEntry,
	SeparatedFragmentsContainer,
	SimpleFragmentsContainer
} from "./container";
import {getTypeOrFunctionValue, TypeOrFunction} from "./type";
import {Page} from "./page";
import {Fragment} from "./fragment";

interface BlockLevelFragment extends Fragment
{
	blockLevel: TypeOrFunction<boolean>
}

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
	return ['string', 'function'].indexOf(typeof fragment['content']) !== -1;
}

function isBlockLevelFragment(fragment: any): fragment is BlockLevelFragment
{
	return ['boolean', 'function'].indexOf(typeof fragment['blockLevel']) !== -1 && isFragment(fragment);
}

function createContainerFromArray(array: Array<FragmentsContainerEntry>): FragmentsContainer
{
	return {
		tree: () => array
	}
}

type BuildMarkdownState = {
	first: boolean
	blankLine: boolean,
}

function buildMarkdownContainer(container: FragmentsContainer | Page | Array<FragmentsContainerEntry>,
                                state: BuildMarkdownState = {first: true, blankLine: false}): string
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
				before = isBlockLevel && !state.first && !state.blankLine ? '\r\n' : '',
				after = isBlockLevel ? '\r\n' : '';
			
			state.first = false;
			state.blankLine = isBlockLevel;
			
			return before + getTypeOrFunctionValue(entry.content, entry) + after;
		}
		else
		{
			console.log(entry);
			throw new Error('There is wrong item in container. Allowed only Fragment, FragmentsContainer, string. Got ' + typeof entry);
		}
		
	}).filter(value => value).join(separator)
}

/**
 * @param {FragmentsContainer|Page} container
 * @returns {string}
 */
export function buildMarkdown(container: FragmentsContainer | Page | Array<FragmentsContainerEntry>): string
{
	return buildMarkdownContainer(container);
}
