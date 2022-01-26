import {TypeOrFunction} from "./type";
import {WrappedFragment, WrappedNewLineFragment} from "./fragment/common";

export type FragmentContent = TypeOrFunction<string | Fragment | Array<FragmentContent>>;

export function blockLevelFragment(constructor: Function)
{
	constructor.prototype.blockLevel = true;
}

export interface Fragment
{
	content: FragmentContent
}

export interface BlockLevelFragment extends Fragment
{
	blockLevel: TypeOrFunction<boolean>
}

export interface LinePrefixFragment extends Fragment
{
	linePrefix: TypeOrFunction<string>
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

export class StrikeThrough extends WrappedFragment
{
	constructor(content: FragmentContent)
	{
		super(content, '~~', '~~');
	}
}

export class Code extends WrappedFragment
{
	constructor(content: FragmentContent)
	{
		super(content, '`', '`');
	}
}

export class CodeBlock extends WrappedNewLineFragment
{
	constructor(code: string, language: string = '')
	{
		super(code, '```' + language, '```');
	}
}

export class Link implements Fragment
{
	
	constructor(private readonly link: string, private readonly name: FragmentContent)
	{
	}
	
	content()
	{
		return ['[', this.name, ']', `(${this.link})`];
	}
}

@blockLevelFragment
export class BlockQuote implements LinePrefixFragment
{
	linePrefix: string = '>';
	
	constructor(public readonly content: FragmentContent)
	{
	}
}

export class Emoji extends WrappedFragment
{
	constructor(emojiCode: string)
	{
		super(emojiCode, ':', ':');
	}
}

export class Highlight extends WrappedFragment
{
	constructor(content: FragmentContent)
	{
		super(content, '==', '==');
	}
}

export class Subscript extends WrappedFragment
{
	constructor(content: FragmentContent)
	{
		super(content, '~', '~');
	}
}