import {FragmentsContainer, FragmentsContainerEntry, SeparatedFragmentsContainer} from "./container";
import {isFragment, isFragmentsContainer} from "./utils";
import {getTypeOrFunctionValue} from "./type";
import {ContentLevel, Fragment, FragmentContent, FragmentLevel, IndentFragment, LinePrefixFragment} from "./fragment";

type Container = FragmentsContainer | Array<FragmentsContainerEntry>;

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
	return ['string', 'function'].indexOf(typeof fragment['level']) !== -1 && isFragment(fragment);
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

function modifyLineContent(lines: Array<MarkdownLine>)
{
	let linesLevel = 0,
		blockLevel = 0;
	
	lines.forEach(line =>
	{
		if(line.levelStart === ContentLevel.LINE)
			linesLevel++;
		else if(line.levelStart === ContentLevel.BLOCK)
			blockLevel++;
		
		if(linesLevel === 1 && blockLevel > 0)
			line.indent++;
		
		if(line.levelEnd === ContentLevel.LINE)
			linesLevel--;
		else if(line.levelEnd === ContentLevel.BLOCK)
			blockLevel--;
	});
}

function modifyLinesByContentLevel(level: ContentLevel, lines: Array<MarkdownLine>)
{
	if(level === ContentLevel.LINE)
		modifyLineContent(lines);
}

function modifySubLinesByContentLevel(level: ContentLevel, line: MarkdownLine, index: number, linesCount: number)
{
	if(level === ContentLevel.DEFAULT)
		return;
	
	if(index === 0 && line.levelStart !== ContentLevel.BLOCK)
		line.levelStart = level;
	
	if(index === linesCount - 1 && line.levelEnd !== ContentLevel.BLOCK)
		line.levelEnd = level;
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

export class MarkdownBuilder
{
	
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
	}
	
	private mergeLines(lines: Array<MarkdownLine>): Array<MarkdownLine>
	{
		const merged: Array<MarkdownLine> = [];
		
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
					this.prependEmptyLines(merged, merged.length - 1, line, prevToMerge);
					prevToMerge = merged[merged.length - 1];
				}
			}
		});
		return merged;
	}
	
	private prependEmptyLines(lines: Array<MarkdownLine>, index: number, line: MarkdownLine, previousLine: MarkdownLine)
	{
		const prevLineBreaks = getContentLevelLineBreaks(previousLine.levelEnd),
			afterLineBreaks = getContentLevelLineBreaks(line.levelStart);
		
		if(prevLineBreaks <= 1 && afterLineBreaks <= 1)
			return;
		
		for(let i = 1; i < Math.max(prevLineBreaks, afterLineBreaks); i++)
		{
			const newLine = new MarkdownLine(''),
				prefixes = line.prefixes.length <= previousLine.prefixes.length ? line.prefixes : previousLine.prefixes;
			
			if(prefixes.length)
				newLine.prefixes = [...prefixes];
			
			newLine.splittedByLeft = newLine.splittedByRight = true;
			
			lines.splice(index + i - 1, 0, newLine);
		}
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
		
		const separator = isSeparatedFragmentsContainer(container) ? getTypeOrFunctionValue(
			container.separator,
			container
		) : '';
		
		container.tree().forEach((entry, index, array) =>
		{
			let entryLines: Array<MarkdownLine>;
			
			if(index > 0 && separator)
				lines.push(new MarkdownLine(separator));
			
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
						
						modifySubLinesByContentLevel(lineLevel, line, index, entryLines.length);
					});
				}
				
				modifyLinesByContentLevel(lineLevel, entryLines);
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
}