import {FragmentsContainer, FragmentsContainerEntry, SeparatedFragmentsContainer} from "./container";
import {Page} from "./page";
import {isFragment, isFragmentsContainer} from "./utils";
import {getTypeOrFunctionValue} from "./type";
import {ContentLevel, Fragment, FragmentContent, FragmentLevel, LinePrefixFragment} from "./fragment";

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

function isContentLevel(fragment: any): fragment is FragmentLevel
{
	return ['number', 'function'].indexOf(typeof fragment['level']) !== -1 && isFragment(fragment);
}

function isLinePrefixFragment(fragment: any): fragment is LinePrefixFragment
{
	return ['string', 'function'].indexOf(typeof fragment['linePrefix']) !== -1 && isFragment(fragment);
}

class FragmentResult
{
	public lineLevel: ContentLevel = ContentLevel.DEFAULT;
	public prefixes: Array<string> = [];
	public indent: number = 0;
	public content: string = '';
	public results: Array<FragmentResult> = [];
	
	constructor(content: string | Array<FragmentResult> = '')
	{
		if(typeof content === 'string')
			this.content = content;
		else if(Array.isArray(content))
			this.results = content;
		else
			throw new Error('Result content can be only string or sub result');
	}
}

enum NewlinePolicy
{
	NONE = 1,
	NEXT_LEVEL = 2,
	NEXT_ANY = 3
}

type builderState = {
	isFirstLine: boolean,
	requireBlankLine: NewlinePolicy,
	requireContentLevel: ContentLevel,
	requireLineEnd: NewlinePolicy,
	linePrefixes: Array<string>;
};

function fillArray<T>(value: T, count: number): Array<T>
{
	return new Array<T>(count).fill(value, 0, count);
}

export class MarkdownBuilder
{
	// TODO move this properties to state object (as like buildFragmentsResults)
	private isFirstFragment: boolean = true;
	private linePrefixes: Array<string> = [];
	private lineIdent: number = 0;
	private requiredBlankLines: boolean = false;
	
	private constructor(private rootContainer: Container)
	{
	}
	
	static build(container: Container)
	{
		return (new MarkdownBuilder(container)).build();
	}
	
	private build(): string
	{
		return this.buildFragmentsResults(
			this.buildContainerFragments(this.rootContainer)
		);
	}
	
	private buildFragmentsResults(results: Array<FragmentResult>, state: builderState = {
		isFirstLine: true,
		requireBlankLine: NewlinePolicy.NONE,
		requireContentLevel: ContentLevel.DEFAULT,
		requireLineEnd: NewlinePolicy.NONE,
		linePrefixes: [] // Todo line prefixes interface for lazy and once calculation of full prefixes
	}): string
	{
		return results.map(entry =>
		{
			let result = entry.content,
				resultPrefixes = '',
				prependLineBreak: number = 0,
				prevPrefixes = state.linePrefixes;
			
			if(state.linePrefixes.length && result && result.match(/\r?\n/g))
			{
				if(state.isFirstLine)
					state.isFirstLine = false;
				
				const newLinesPrefixes = state.linePrefixes.join('');
				result = result.split(/\r?\n/g).map((line, index) =>
				{
					return index === 0 ? line : (newLinesPrefixes + ' ' + line);
				}).join('\r\n');
			}
			
			// if current entry is block or line level
			if(entry.lineLevel !== ContentLevel.DEFAULT)
			{
				//if not first line or previous entry is block or line level
				if(!state.isFirstLine || state.requireBlankLine !== NewlinePolicy.NONE)
					prependLineBreak = entry.lineLevel === ContentLevel.BLOCK ||
					state.requireContentLevel === ContentLevel.BLOCK ? 2 : 1;
				
				state.requireContentLevel = entry.lineLevel;
				state.requireBlankLine = NewlinePolicy.NEXT_LEVEL;
				state.linePrefixes = [...entry.prefixes];
			}
			else if(state.requireBlankLine === NewlinePolicy.NEXT_ANY)
			{
				prependLineBreak = state.requireContentLevel === ContentLevel.BLOCK ? 2 : 1;
				state.requireContentLevel = ContentLevel.DEFAULT;
				state.requireBlankLine = NewlinePolicy.NONE;
				state.linePrefixes = prevPrefixes;
			}
			
			if(prependLineBreak && state.isFirstLine)
				state.isFirstLine = false;
			
			if(prependLineBreak)
				resultPrefixes += fillArray('\r\n', prependLineBreak)
					.join(prevPrefixes.join(''));
			
			if(entry.prefixes.length && entry.content)
				resultPrefixes += entry.prefixes.join('') + ' ';
			
			if(entry.results.length)
				result += this.buildFragmentsResults(entry.results, state);
			
			if(entry.lineLevel !== ContentLevel.DEFAULT)
			{
				state.requireBlankLine = NewlinePolicy.NEXT_ANY;
				state.requireContentLevel = entry.lineLevel;
				state.linePrefixes = prevPrefixes;
			}
			
			return resultPrefixes + result;
		}).join('');
	}
	
	private buildContainerFragments(container: Container): Array<FragmentResult>
	{
		const results: Array<FragmentResult> = [];
		
		if(Array.isArray(container))
			container = createContainerFromArray(container);
		
		container.tree().forEach(entry =>
		{
			let result: FragmentResult,
				clearPrefix = false;
			
			if(typeof entry === 'string')
				result = new FragmentResult(entry);
			else if(Array.isArray(entry))
				result = new FragmentResult(this.buildContainerFragments(entry));
			else if(isFragment(entry))
			{
				if(isLinePrefixFragment(entry))
				{
					this.linePrefixes.push(getTypeOrFunctionValue(entry.linePrefix, entry));
					clearPrefix = true;
				}
				result = new FragmentResult(this.buildFragment(entry));
				
				if(isContentLevel(entry))
					result.lineLevel = getTypeOrFunctionValue(entry.level, entry);
				
				if(!result.lineLevel)
					result.lineLevel = ContentLevel.DEFAULT;
			}
			else
				throw new Error('There is wrong item in container. Allowed only Fragment, FragmentsContainer, string. Got ' + typeof entry);
			
			if(this.linePrefixes.length)
				result.prefixes = [...this.linePrefixes];
			
			results.push(result);
			
			if(clearPrefix)
				this.linePrefixes.pop();
		});
		return results;
	}
	
	private buildFragment(fragment: Fragment): Array<FragmentResult>
	{
		const content = getTypeOrFunctionValue(fragment.content, fragment);
		if(typeof content === 'string')
			return this.buildContainerFragments([content]);
		else if(Array.isArray(content))
			return this.buildFragmentArrayContent(content);
		else if(isFragment(content))
			return this.buildFragment(content);
		
		throw new Error('Fragment content can be only string, fragment or Array of strings or fragments');
	}
	
	private buildFragmentArrayContent(content: Array<FragmentContent>): Array<FragmentResult>
	{
		const results: Array<FragmentResult> = [];
		if(content.length)
		{
			for(const contentItem of content)
			{
				if(typeof contentItem === 'string')
					results.push(...this.buildContainerFragments([contentItem]));
				else if(Array.isArray(contentItem))
					results.push(...this.buildFragmentArrayContent(contentItem));
				else if(isFragment(contentItem))
					results.push(...this.buildContainerFragments([contentItem]));
			}
		}
		return results;
	}
}