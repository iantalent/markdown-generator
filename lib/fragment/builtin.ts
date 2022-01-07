import {Fragment, FragmentContent, SimpleFragment} from "../fragment";

class WrappedFragment implements Fragment
{
	constructor(private readonly $content: string | Fragment, private readonly $before: string, private readonly $after: string)
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
	
	constructor(content: string | Fragment, level: number = 1)
	{
		super(content, '#'.repeat(level) + ' ', '');
	}
}

export class Bold extends WrappedFragment
{
	constructor(content: string | Fragment)
	{
		super(content, '**', '**')
	}
}

export class Italic extends WrappedFragment
{
	constructor(content: string | Fragment)
	{
		super(content, '*', '*')
	}
}

export class BoldItalic extends WrappedFragment
{
	constructor(content: string | Fragment)
	{
		super(content, '***', '***')
	}
}