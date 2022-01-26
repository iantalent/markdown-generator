import {TypeOrFunction} from "./type";
import {WrappedFragment, WrappedNewLineFragment} from "./fragment/common";
import Ordered = Chai.Ordered;

export type FragmentContent = (() => FragmentContent) | TypeOrFunction<string | Fragment | Array<FragmentContent>>;

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

export interface IndentFragment extends Fragment
{
	indent: true
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

export class Superscript extends WrappedFragment
{
	constructor(content: FragmentContent)
	{
		super(content, '^', '^');
	}
}

export abstract class List implements IndentFragment
{
	indent: true = true;
	private items: Array<FragmentContent> = [];
	
	add(...items: Array<FragmentContent>)
	{
		if(items.length)
			this.items.push(...items);
		
		return this;
	}
	
	protected abstract prefix(item: FragmentContent, index: number): string
	
	content(): FragmentContent
	{
		return this.items.map((item, index) =>
		{
			return [(index > 0 ? '\r\n' : ''), this.prefix(item, index), ' ', item];
		});
	}
}

export class OrderedList extends List
{
	protected prefix(item: FragmentContent, index: number): string
	{
		return (index + 1) + '.';
	}
}

export class UnorderedList extends List
{
	protected prefix(item: FragmentContent, index: number): string
	{
		return "-";
	}
}

type TodoListItem = {
	state: boolean,
	content: FragmentContent
};

export class TodoList implements IndentFragment
{
	indent: true = true;
	private items: Array<TodoListItem> = [];
	
	add(state: boolean, ...items: Array<FragmentContent>)
	{
		if(items.length)
		{
			for(const item of items)
				this.items.push({
					state: state,
					content: item
				});
		}
		
		return this;
	}
	
	content(): FragmentContent
	{
		return this.items.map((item, index) =>
		{
			return [(index > 0 ? '\r\n' : ''), '[' + (item.state ? 'x' : ' ') + ']', ' ', item.content];
		});
	}
}