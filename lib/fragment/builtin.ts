import {Fragment} from "../fragment";
import {WrappedFragment, WrappedFragmentContent} from "./common";

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