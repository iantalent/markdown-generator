import {
	FragmentsContainer,
	FragmentsContainerEntry,
	SeparatedFragmentsContainer,
	SimpleFragmentsContainer
} from "./container";
import {Page} from "./page";
import {isFragment, isFragmentsContainer} from "./utils";
import {getTypeOrFunctionValue} from "./type";
import {BlockLevelFragment, Fragment, FragmentContent, LinePrefixFragment} from "./fragment";

type Container = FragmentsContainer | Page | Array<FragmentsContainerEntry>;

function isSeparatedFragmentsContainer(container: any): container is SeparatedFragmentsContainer
{
	return ['string', 'function'].indexOf(typeof container['separator']) !== -1 && isFragmentsContainer(container);
}

function createContainerFromArray(array: Array<FragmentsContainerEntry>): FragmentsContainer
{
	return {
		tree: () => array
	}
}

function isBlockLevelFragment(fragment: any): fragment is BlockLevelFragment
{
	return ['boolean', 'function'].indexOf(typeof fragment['blockLevel']) !== -1 && isFragment(fragment);
}

function isLinePrefixFragment(fragment: any): fragment is LinePrefixFragment
{
	return ['string', 'function'].indexOf(typeof fragment['linePrefix']) !== -1 && isFragment(fragment);
}

export class MarkdownBuilder
{
	
	private isFirstFragment: boolean = true;
	private linePrefixes: Array<string> = [];
	private lineIdent: number = 0;
	private requiredBlankLines: boolean = false;
	
	private constructor(private rootContainer: Container)
	{
	}
	
	private build(): string
	{
		return this.buildContainer(this.rootContainer);
	}
	
	private buildContainer(container: Container): string
	{
		const separator = isSeparatedFragmentsContainer(container) ?
			getTypeOrFunctionValue(container.separator, container) : '';
		
		if(Array.isArray(container))
			container = createContainerFromArray(container);
		
		return container.tree().map(entry =>
		{
			if(typeof entry === 'string')
				return entry;
			else if(Array.isArray(entry))
				return this.buildContainer((new SimpleFragmentsContainer()).add(entry));
			else if(isFragmentsContainer(entry))
				return this.buildContainer(entry);
			else if(isFragment(entry))
			{
				const isBlockLevel = isBlockLevelFragment(entry) && getTypeOrFunctionValue(entry.blockLevel, entry),
					before = !this.isFirstFragment && (isBlockLevel || this.requiredBlankLines) ? '\r\n\r\n' : '',
					isLinePrefix = isLinePrefixFragment(entry);
				
				if(isLinePrefix)
					this.linePrefixes.push(getTypeOrFunctionValue(entry.linePrefix, entry));
				
				let result = this.processFragmentContent(entry);
				
				this.isFirstFragment = false;
				this.requiredBlankLines = isBlockLevel;
				
				if(this.linePrefixes.length)
					result = this.prefixLines(result);
				
				if(isLinePrefix)
					this.linePrefixes.pop();
				
				return before + result;
			}
			else
				throw new Error('There is wrong item in container. Allowed only Fragment, FragmentsContainer, string. Got ' + typeof entry);
			
		}).filter(value => value).join(separator)
	}
	
	prefixLines(content: string): string
	{
		const prefixes = this.linePrefixes.join('');
		return content.split('\r\n').map(line => prefixes + ' ' +  line).join('\r\n');
	}
	
	processFragmentArrayContent(contentArray: Array<FragmentContent>): string
	{
		const parts: Array<string> = [];
		for(const contentItem of contentArray)
		{
			if(typeof contentItem === 'string')
				parts.push(contentItem);
			else if(Array.isArray(contentItem))
				parts.push(this.processFragmentArrayContent(contentItem));
			else if(isFragment(contentItem))
				parts.push(this.processFragmentContent(contentItem));
		}
		return parts.join('');
	}
	
	processFragmentContent(fragment: Fragment): string
	{
		const content = getTypeOrFunctionValue(fragment.content, fragment);
		
		if(typeof content === 'string')
			return content;
		
		if(Array.isArray(content))
			return this.processFragmentArrayContent(content);
		
		if(isFragment(content))
			return this.processFragmentContent(content);
		
		throw new Error('Fragment content can be only string, fragment or Array of strings or fragments');
	}
	
	static build(container: Container)
	{
		return (new MarkdownBuilder(container)).build();
	}
}