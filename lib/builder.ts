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

function mergeLines(lines: Array<MarkdownLine>, moreLines: Array<MarkdownLine>)
{
	if(!moreLines.length)
		return;
	
	for(const value of moreLines)
		lines.push(value);
}

function buildLinesFromContent(content: string)
{
	return content.split('\r\n').map(lineContent =>
	{
		const line = new MarkdownLine(lineContent);
		line.virtual = false;
		return line;
	});
}

class MarkdownLine
{
	public needBlankLineBefore: boolean = false;
	public needBlankLineAfter: boolean = false;
	public blockLevelLine: boolean = false;
	public readonly prefixes: Array<string> = [];
	public indent: number = 0;
	public virtual: boolean = true;
	public readonly isBlank: boolean;
	
	constructor(public readonly content: string)
	{
		this.isBlank = !content.trim().length;
	}
}

class FragmentResult
{
	public blockLevel: boolean = false;
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

export class MarkdownBuilder
{
	
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
		return this.buildContainer(this.rootContainer);
	}
	
	private buildContainerNew(container: Container): Array<FragmentResult>
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
			{
				result = new FragmentResult(this.buildContainerNew(entry));
			}
			else if(isFragment(entry))
			{
				const isBlockLevel = isBlockLevelFragment(entry);
				
				if(isLinePrefixFragment(entry))
				{
					this.linePrefixes.push(getTypeOrFunctionValue(entry.linePrefix, entry));
					clearPrefix = true;
				}
				result = new FragmentResult(this.buildFragment(entry));
				result.blockLevel = isBlockLevel;
				
			}
			else
				throw new Error('There is wrong item in container. Allowed only Fragment, FragmentsContainer, string. Got ' + typeof entry);
			
			results.push(result);
			
			if(clearPrefix)
				this.linePrefixes.pop();
		});
		return results;
	}
	
	private buildFragment(fragment: Fragment): Array<FragmentResult>
	{
		return [];
	}
	
	private buildContainer(container: Container): string
	{
		const lines = this.buildLines(container);
		let content = '';
		if(lines.length)
		{
			for(let index = 0; index < lines.length; index++)
			{
				const line = lines[index];
				if(line.needBlankLineBefore && index > 0 && !lines[index - 1].isBlank)
					content += '\r\n';
				
				let lineContent = line.content;
				
				if(line.indent)
					lineContent = '\t'.repeat(line.indent) + lineContent;
				
				if(line.prefixes.length)
					lineContent = line.prefixes.join('') + ' ' + lineContent;
				
				if(line.needBlankLineAfter && index + 1 < lines.length && !lines[index + 1].isBlank)
					content += '\r\n';
			}
		}
		return content;
	}
	
	private buildLines(container: Container): Array<MarkdownLine>
	{
		const separator = isSeparatedFragmentsContainer(container) ?
			getTypeOrFunctionValue(container.separator, container) : '';
		
		if(Array.isArray(container))
			container = createContainerFromArray(container);
		
		const lines: Array<MarkdownLine> = [];
		
		container.tree().forEach(entry =>
		{
			if(typeof entry === 'string')
				return entry;
			else if(Array.isArray(entry))
				mergeLines(lines, this.buildLines((new SimpleFragmentsContainer()).add(entry)));
			else if(isFragmentsContainer(entry))
				mergeLines(lines, this.buildLines(entry));
			else if(isFragment(entry))
			{
				mergeLines(lines, this.getFragmentLines(entry));
				/*const isBlockLevel = isBlockLevelFragment(entry) && getTypeOrFunctionValue(entry.blockLevel, entry),
					before = !this.isFirstFragment && (isBlockLevel || this.requiredBlankLines) ? '\r\n\r\n' : '',
					isLinePrefix = isLinePrefixFragment(entry);
				
				if(isLinePrefix)
					this.linePrefixes.push(getTypeOrFunctionValue(entry.linePrefix, entry));
				
				let entryLines = this.getFragmentLines(entry);
				
				this.isFirstFragment = false;
				this.requiredBlankLines = isBlockLevel;
				
				if(this.linePrefixes.length)
					result = this.prefixLines(result);
				
				if(isLinePrefix)
					this.linePrefixes.pop();
				
				return entryLines;*/
			}
			else
				throw new Error('There is wrong item in container. Allowed only Fragment, FragmentsContainer, string. Got ' + typeof entry);
		});
		
		//console.log(lines);
		
		return lines;
	}
	
	getFragmentLines(fragment: Fragment): Array<MarkdownLine>
	{
		const content = getTypeOrFunctionValue(fragment.content, fragment);
		let lines;
		
		if(typeof content === 'string')
			lines = buildLinesFromContent(content);
		else if(Array.isArray(content))
			lines = this.getArrayContentLines(content);
		else if(isFragment(content))
			lines = this.getFragmentLines(content);
		else
			throw new Error('Fragment content can be only string, fragment or Array of strings or fragments');
		
		if(lines.length)
		{
			let isBlockLevel = isBlockLevelFragment(fragment),
				prefix = '';
			
			if(isBlockLevel)
			{
				lines[0].needBlankLineBefore = true;
				lines[lines.length - 1].needBlankLineAfter = true;
				
			}
			if(isLinePrefixFragment(fragment))
				prefix = getTypeOrFunctionValue(fragment.linePrefix, fragment);
			
			if(isBlockLevel || prefix)
			{
				lines.forEach(line =>
				{
					if(isBlockLevel)
						line.blockLevelLine = true;
					
					if(prefix)
						line.prefixes.push(prefix);
				})
			}
		}
		return lines;
	}
	
	getArrayContentLines(contentArray: Array<FragmentContent>): Array<MarkdownLine>
	{
		const lines: Array<MarkdownLine> = [];
		for(const contentItem of contentArray)
		{
			if(typeof contentItem === 'string')
				mergeLines(lines, buildLinesFromContent(contentItem));
			else if(Array.isArray(contentItem))
				mergeLines(lines, this.getArrayContentLines(contentItem));
			else if(isFragment(contentItem))
				mergeLines(lines, this.getFragmentLines(contentItem));
			else
				throw new Error('Content array can store only strings, fragments or another content arrays');
		}
		console.log('array lines', lines);
		return lines;
	}
	
	prefixLines(content: string): string
	{
		const prefixes = this.linePrefixes.join('');
		return content.split('\r\n').map(line => prefixes + ' ' + line).join('\r\n');
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
}