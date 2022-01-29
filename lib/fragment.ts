import {TypeOrFunction} from "./type";
import {WrappedFragment, WrappedNewLineFragment} from "./fragment/common";

export type FragmentContent = (() => FragmentContent) | TypeOrFunction<string | Fragment | Array<FragmentContent>>;

export interface Fragment
{
	content: FragmentContent
}

export enum ContentLevel
{
	DEFAULT = 1,
	LINE = 2,
	BLOCK = 3
}

export interface FragmentLevel extends Fragment
{
	level: TypeOrFunction<ContentLevel>
}

export interface LinePrefixFragment extends Fragment
{
	linePrefix: TypeOrFunction<string>
}

export interface IndentFragment extends Fragment
{
	indent: true
}

export class SimpleFragment implements Fragment, FragmentLevel
{
	constructor(public readonly content: string, public readonly level: ContentLevel = ContentLevel.BLOCK)
	{
	}
}

export class Paragraph implements FragmentLevel
{
	level: ContentLevel = ContentLevel.BLOCK;
	
	constructor(public readonly content: FragmentContent)
	{
	}
}

export class Heading extends WrappedFragment implements FragmentLevel
{
	level: ContentLevel = ContentLevel.BLOCK;
	
	constructor(content: FragmentContent, level: number = 1)
	{
		super(content, '#'.repeat(level) + ' ', '');
	}
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

export class BlockQuote implements FragmentLevel, LinePrefixFragment
{
	level: ContentLevel = ContentLevel.BLOCK;
	
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

export class ListItem implements Fragment
{
	constructor(private readonly _content: FragmentContent)
	{
	}
	
	content(): FragmentContent
	{
		return this._content;
	}
}


class ListEntry<T extends ListItem> implements FragmentLevel
{
	content: FragmentContent;
	level: ContentLevel = ContentLevel.LINE;
	
	constructor(item: T, prefix: string)
	{
		this.content = [
			prefix,
			prefix ? ' ' : '',
			item
		];
	}
}

export abstract class List<T extends ListItem> implements IndentFragment
{
	indent: true = true;
	private entries: Array<ListEntry<T>> = [];
	
	add(...items: Array<T>): this
	{
		if(items.length)
		{
			for(const item of items)
			{
				this.entries.push(new ListEntry<T>(
					item,
					this.prefix(item, this.entries.length)
				))
			}
		}
		return this;
	}
	
	protected abstract prefix(item: T, listLength: number): string
	
	content(): FragmentContent
	{
		return this.entries;
	}
}

export class OrderedList extends List<ListItem>
{
	protected prefix(item: FragmentContent, listLength: number): string
	{
		return (listLength + 1) + '.';
	}
}

export class UnorderedList extends List<ListItem>
{
	protected prefix(item: FragmentContent): string
	{
		return "-";
	}
}

export class TodoListItem extends ListItem
{
	constructor(public readonly state: boolean, content: FragmentContent)
	{
		super(content);
	}
}

export class TodoList extends List<TodoListItem>
{
	protected prefix(item: TodoListItem, listLength: number): string
	{
		return "[" + (item.state ? 'x' : ' ') + "]";
	}
	
	add(...items: Array<TodoListItem>): this;
	add(state: boolean, content: FragmentContent): this
	add(contentOrState: any, content?: any): this
	{
		return typeof contentOrState === 'boolean' ?
			super.add(new TodoListItem(contentOrState, content)) :
			super.add(contentOrState);
	}
}