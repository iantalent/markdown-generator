import {TypeOrFunction} from "./type";
import {WrappedFragment, WrappedFragmentContent} from "./fragment/common";

export type FragmentContent = TypeOrFunction<string>;

export function blockLevelFragment(constructor: Function)
{
	constructor.prototype.blockLevel = true;
}

export interface Fragment
{
	content: FragmentContent
}

export class SimpleFragment implements Fragment
{
	constructor(public readonly content: string)
	{
	}
}

@blockLevelFragment
export class Paragraph
{
	constructor(private readonly content: string)
	{
	}
}

@blockLevelFragment
export class Heading extends WrappedFragment
{
	constructor(content: WrappedFragmentContent, level: number = 1)
	{
		super(content, '#'.repeat(level) + ' ', '');
	}
	
	blockLevel: boolean = true;
}

export class Bold extends WrappedFragment
{
	constructor(content: WrappedFragmentContent)
	{
		super(content, '**', '**')
	}
}

export class Italic extends WrappedFragment
{
	constructor(content: WrappedFragmentContent)
	{
		super(content, '*', '*')
	}
}

export class BoldItalic extends WrappedFragment
{
	constructor(content: WrappedFragmentContent)
	{
		super(content, '***', '***')
	}
}

export class Code extends WrappedFragment
{
	constructor(content: WrappedFragmentContent)
	{
		super(content, '`', '`');
	}
}

export class Link implements Fragment
{
	
	constructor(private readonly name: string, private readonly link: string)
	{
	}
	
	content()
	{
		return `[${this.name}](${this.link})`;
	}
}