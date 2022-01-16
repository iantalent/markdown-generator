import {TypeOrFunction} from "./type";

export type FragmentContent = TypeOrFunction<string>;

import {WrappedFragment, WrappedFragmentContent} from "./fragment/common";

export interface Fragment
{
	content: FragmentContent
}

export interface BlankLinesFragment extends Fragment
{
	blankLines: TypeOrFunction<boolean>
}

export class SimpleFragment implements Fragment
{
	constructor(private readonly $content: string)
	{
	}
	
	content()
	{
		return this.$content
	};
}

export class Heading extends WrappedFragment implements BlankLinesFragment
{
	constructor(content: WrappedFragmentContent, level: number = 1)
	{
		super(content, '#'.repeat(level) + ' ', '');
	}
	
	blankLines: boolean = true;
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