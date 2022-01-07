import {Fragment, FragmentContent} from "../fragment";

type WrappedFragmentContent = string | Fragment;

class WrappedFragment implements Fragment
{
	constructor(private readonly $content: WrappedFragmentContent, private readonly $before: string, private readonly $after: string)
	{
	}
	
	content()
	{
		return this.$before + (
			typeof this.$content === 'string' ?
				this.$content :
				(typeof this.$content.content === 'string' ? this.$content.content : this.$content.content())
		) + this.$after;
	}
}

export class Heading extends WrappedFragment
{
	
	constructor(content: WrappedFragmentContent, level: number = 1)
	{
		super(content, '#'.repeat(level) + ' ', '');
	}
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