import {FragmentsContainer, FragmentsContainerEntry, SeparatedFragmentsContainer} from "./container";
import {Page} from "./page";
import {isFragment, isFragmentsContainer} from "./utils";
import {getTypeOrFunctionValue} from "./type";
import {ContentLevel, Fragment, FragmentContent, FragmentLevel, IndentFragment, LinePrefixFragment} from "./fragment";

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

function isIndentFragment(fragment: any): fragment is IndentFragment
{
	return typeof fragment['indent'] === 'boolean' && fragment['indent'] === true && isFragment(fragment);
}

function isLinePrefixFragment(fragment: any): fragment is LinePrefixFragment
{
	return ['string', 'function'].indexOf(typeof fragment['linePrefix']) !== -1 && isFragment(fragment);
}

function getContentLevelLineBreaks(level: ContentLevel)
{
	switch(level)
	{
		case ContentLevel.BLOCK:
			return 2;
		case ContentLevel.LINE:
			return 1;
		default:
			return 0;
	}
}

function getFragmentContentLevel(fragment: Fragment): ContentLevel
{
	if(isContentLevel(fragment))
	{
		const contentLevel = getTypeOrFunctionValue(fragment.level, fragment);
		
		if(contentLevel)
			return contentLevel;
	}
	return ContentLevel.DEFAULT;
}

export class MarkdownLine
{
	prefixes: Array<string> = [];
	indent: number = 0;
	levelStart: ContentLevel = ContentLevel.DEFAULT;
	levelEnd: ContentLevel = ContentLevel.DEFAULT;
	splittedByLeft: boolean = false;
	splittedByRight: boolean = false;
	
	constructor(private lineContent: string)
	{
	}
	
	static fromContent(content: string): Array<MarkdownLine>
	{
		return content.split(/\r?\n/g).map((line, index, array) =>
		{
			const newLine = new MarkdownLine(line);
			
			if(array.length > 1)
			{
				newLine.splittedByRight = index + 1 < array.length;
				newLine.splittedByLeft = index > 0;
			}
			return newLine;
		});
	}
	
	canBeMerged(line: MarkdownLine): boolean
	{
		return this.levelEnd === ContentLevel.DEFAULT && line.levelStart === ContentLevel.DEFAULT &&
			(!this.splittedByRight && !line.splittedByLeft);
	}
	
	merge(line: MarkdownLine)
	{
		if(!this.canBeMerged(line))
			throw new Error('This lines can\'t be merged. You should check it before merge (via canBeMerged)');
		
		this.lineContent += line.lineContent;
		this.levelEnd = line.levelEnd;
		this.splittedByRight = line.splittedByRight;
	}
	
	isEmpty()
	{
		return this.lineContent.length <= 0;
	}
	
	content(): string
	{
		return this.lineContent;
	}
}

/**
 * @deprecated
 */
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
	indent: number,
	linePrefixes: Array<string>
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
	private lineIndent: number = -1;
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
		return this.buildLines(
			this.mergeLines(
				this.buildContainerFragments(this.rootContainer)
			)
		);
		/*return this.buildFragmentsResults(
			this.buildContainerFragmentsOld(this.rootContainer)
		);*/
	}
	
	private prependEmptyLines(lines: Array<MarkdownLine>, count: number, index: number, prefixes: Array<string> = [])
	{
		for(let i = 0; i < count; i++)
		{
			const line = new MarkdownLine('');
			
			if(prefixes.length)
				line.prefixes = [...prefixes];
			
			line.splittedByLeft = line.splittedByRight = true;
			
			lines.splice(index + i, 0, line);
		}
	}
	
	private mergeLines(lines: Array<MarkdownLine>): Array<MarkdownLine>
	{
		const merged: Array<MarkdownLine> = [];
		let prependedNewLine = false;
		
		let prevToMerge: MarkdownLine | null = null;
		
		lines.forEach((line) =>
		{
			merged.push(line);
			
			if(!prevToMerge)
				prevToMerge = line;
			else
			{
				if(prevToMerge.canBeMerged(line))
				{
					prevToMerge.merge(line);
					merged.splice(merged.length - 1, 1);
				}
				else
				{
					const prevLineBreaks = getContentLevelLineBreaks(prevToMerge.levelEnd),
						afterLineBreaks = getContentLevelLineBreaks(line.levelStart);
					if(prevLineBreaks > 1 || afterLineBreaks > 1)
					{
						prependedNewLine = true;
						this.prependEmptyLines(
							merged,
							Math.max(prevLineBreaks, afterLineBreaks) - 1,
							merged.length - 1,
							afterLineBreaks > 1 && line.prefixes.length < prevToMerge.prefixes.length ? line.prefixes : prevToMerge.prefixes
						);
						prevToMerge = merged[merged.length - 1];
					}
					else
						prevToMerge = line;
				}
			}
		});
		return merged;
	}
	
	private buildLines(lines: Array<MarkdownLine>): string
	{
		return lines.map(line =>
		{
			let prefixes = '',
				lineContent = line.content();
			
			if(lineContent.length || line.prefixes.length)
			{
				if(line.indent > 1)
					prefixes += ('\t').repeat(line.indent - 1);
				
				if(line.prefixes.length)
					prefixes += line.prefixes.join('') + (lineContent.length ? ' ' : '');
			}
			return prefixes + lineContent;
		}).join('\r\n');
	}
	
	private buildContainerFragments(container: Container): Array<MarkdownLine>
	{
		const lines: Array<MarkdownLine> = [];
		
		if(Array.isArray(container))
			container = createContainerFromArray(container);
		
		container.tree().forEach(entry =>
		{
			let entryLines: Array<MarkdownLine>;
			
			if(typeof entry === 'string')
				entryLines = MarkdownLine.fromContent(entry);
			else if(Array.isArray(entry))
				entryLines = this.buildContainerFragments(entry);
			else if(isFragment(entry))
			{
				entryLines = this.buildFragment(entry);
				let prefix = isLinePrefixFragment(entry) ? getTypeOrFunctionValue(entry.linePrefix, entry) : null,
					indent = isIndentFragment(entry),
					lineLevel = getFragmentContentLevel(entry);
				
				if(prefix || indent || lineLevel !== ContentLevel.DEFAULT)
				{
					entryLines.forEach((line, index) =>
					{
						if(prefix)
							line.prefixes.unshift(prefix);
						
						if(indent)
							line.indent++;
						
						if(lineLevel !== ContentLevel.DEFAULT)
						{
							if(index === 0)
								line.levelStart = lineLevel;
							
							if(index === entryLines.length - 1)
								line.levelEnd = lineLevel;
						}
					});
				}
			}
			else
				throw new Error('There is wrong item in container. Allowed only Fragment, FragmentsContainer, string. Got ' + typeof entry);
			
			lines.push(...entryLines);
		});
		
		return lines;
	}
	
	private buildFragment(fragment: Fragment): Array<MarkdownLine>
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
	
	private buildFragmentArrayContent(content: Array<FragmentContent>): Array<MarkdownLine>
	{
		const results: Array<MarkdownLine> = [];
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
	
	private buildFragmentsResults(results: Array<FragmentResult>, state: builderState = {
		isFirstLine: true,
		requireBlankLine: NewlinePolicy.NONE,
		requireContentLevel: ContentLevel.DEFAULT,
		requireLineEnd: NewlinePolicy.NONE,
		indent: -1,
		linePrefixes: [] // Todo line prefixes interface for lazy and once calculation of full prefixes
	}): string
	{
		return results.map(entry =>
		{
			let result = entry.content,
				resultPrefixes = '',
				prependLineBreak: number = 0,
				prevPrefixes = state.linePrefixes,
				prevIndent = state.indent;
			
			if((state.linePrefixes.length || state.indent > 0) && result && result.match(/\r?\n/g))
			{
				if(state.isFirstLine)
					state.isFirstLine = false;
				
				let newLinesPrefixes = state.linePrefixes.length ? state.linePrefixes.join('') : 0;
				
				if(state.indent > 0)
					newLinesPrefixes = fillArray('\t', state.indent).join('') + newLinesPrefixes;
				
				result = result.split(/\r?\n/g).map((line, index) =>
				{
					return index === 0 ? line : (newLinesPrefixes + ' ' + line);
				}).join('\r\n');
			}
			
			state.linePrefixes = [...entry.prefixes];
			state.indent = entry.indent;
			
			// if current entry is block or line level
			if(entry.lineLevel !== ContentLevel.DEFAULT)
			{
				//if not first line or previous entry is block or line level
				if(!state.isFirstLine || state.requireBlankLine !== NewlinePolicy.NONE)
					prependLineBreak = entry.lineLevel === ContentLevel.BLOCK ||
					state.requireContentLevel === ContentLevel.BLOCK ? 2 : 1;
				
				state.requireContentLevel = entry.lineLevel;
				state.requireBlankLine = NewlinePolicy.NEXT_LEVEL;
			}
			else if(state.requireBlankLine === NewlinePolicy.NEXT_ANY)
			{
				if(!state.isFirstLine)
					prependLineBreak = state.requireContentLevel === ContentLevel.BLOCK ? 2 : 1;
				
				state.requireContentLevel = ContentLevel.DEFAULT;
				state.requireBlankLine = NewlinePolicy.NONE;
				//state.linePrefixes = prevPrefixes;// this does't mean anything
			}
			
			if(prependLineBreak)
			{
				if(state.isFirstLine)
					state.isFirstLine = false;
				
				resultPrefixes += fillArray('\r\n', prependLineBreak)
					.join((state.indent > 0 ? fillArray('\t', state.indent).join('') : '') + prevPrefixes.join(''));
			}
			
			if(entry.prefixes.length && entry.content)
				resultPrefixes += entry.prefixes.join('') + ' ';
			
			if(entry.results.length)
				result += this.buildFragmentsResults(entry.results, state);
			
			if(entry.lineLevel !== ContentLevel.DEFAULT)
			{
				state.requireBlankLine = NewlinePolicy.NEXT_ANY;
				state.requireContentLevel = entry.lineLevel;
				state.linePrefixes = prevPrefixes;
				state.indent = prevIndent;
			}
			
			return resultPrefixes + result;
		}).join('');
	}
	
	private buildContainerFragmentsOld(container: Container): Array<FragmentResult>
	{
		const results: Array<FragmentResult> = [];
		
		if(Array.isArray(container))
			container = createContainerFromArray(container);
		
		container.tree().forEach(entry =>
		{
			let result: FragmentResult,
				clearPrefix = false,
				clearIndent = false;
			
			if(typeof entry === 'string')
				result = new FragmentResult(entry);
			else if(Array.isArray(entry))
				result = new FragmentResult(this.buildContainerFragmentsOld(entry));
			else if(isFragment(entry))
			{
				if(isLinePrefixFragment(entry))
				{
					this.linePrefixes.push(getTypeOrFunctionValue(entry.linePrefix, entry));
					clearPrefix = true;
				}
				if(isIndentFragment(entry))
				{
					this.lineIndent++;
					clearIndent = true;
				}
				result = new FragmentResult(this.buildFragmentOld(entry));
				
				if(isContentLevel(entry))
					result.lineLevel = getTypeOrFunctionValue(entry.level, entry);
				
				if(!result.lineLevel)
					result.lineLevel = ContentLevel.DEFAULT;
			}
			else
				throw new Error('There is wrong item in container. Allowed only Fragment, FragmentsContainer, string. Got ' + typeof entry);
			
			if(this.linePrefixes.length)
				result.prefixes = [...this.linePrefixes];
			
			if(this.lineIndent > 0)
				result.indent = this.lineIndent;
			
			results.push(result);
			
			if(clearPrefix)
				this.linePrefixes.pop();
			
			if(clearIndent)
				this.lineIndent--;
		});
		return results;
	}
	
	private buildFragmentOld(fragment: Fragment): Array<FragmentResult>
	{
		const content = getTypeOrFunctionValue(fragment.content, fragment);
		if(typeof content === 'string')
			return this.buildContainerFragmentsOld([content]);
		else if(Array.isArray(content))
			return this.buildFragmentArrayContentOld(content);
		else if(isFragment(content))
			return this.buildFragmentOld(content);
		
		throw new Error('Fragment content can be only string, fragment or Array of strings or fragments');
	}
	
	private buildFragmentArrayContentOld(content: Array<FragmentContent>): Array<FragmentResult>
	{
		const results: Array<FragmentResult> = [];
		if(content.length)
		{
			for(const contentItem of content)
			{
				if(typeof contentItem === 'string')
					results.push(...this.buildContainerFragmentsOld([contentItem]));
				else if(Array.isArray(contentItem))
					results.push(...this.buildFragmentArrayContentOld(contentItem));
				else if(isFragment(contentItem))
					results.push(...this.buildContainerFragmentsOld([contentItem]));
			}
		}
		return results;
	}
}