import {TypeOrFunction} from "./type";
import {WrappedFragment} from "./fragment/common";

export type FragmentContent = TypeOrFunction<string | Fragment | Array<FragmentContent>>;

export function blockLevelFragment(constructor: Function)
{
	constructor.prototype.blockLevel = true;
}

export interface BlockLevelFragment extends Fragment
{
	blockLevel: TypeOrFunction<boolean>
}

export interface Fragment
{
	content: FragmentContent
}

export class SimpleFragment implements Fragment, BlockLevelFragment
{
	constructor(public readonly content: string, public readonly blockLevel: boolean = false)
	{
	}
}

@blockLevelFragment
export class Paragraph implements Fragment
{
	constructor(public readonly content: FragmentContent)
	{
	}
}

@blockLevelFragment
export class Heading extends WrappedFragment
{
	constructor(content: FragmentContent, level: number = 1)
	{
		super(content, '#'.repeat(level) + ' ', '');
	}
	
	blockLevel: boolean = true;
}

export class Bold extends WrappedFragment
{
	constructor(content: FragmentContent)
	{
		super(content, '**', '**')
	}
}

export class Italic extends WrappedFragment
{
	constructor(content: FragmentContent)
	{
		super(content, '*', '*')
	}
}

export class BoldItalic extends WrappedFragment
{
	constructor(content: FragmentContent)
	{
		super(content, '***', '***')
	}
}

export class Code extends WrappedFragment
{
	constructor(content: FragmentContent)
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