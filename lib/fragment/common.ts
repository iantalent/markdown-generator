import {Fragment} from "../fragment";

export type WrappedFragmentContent = string | Fragment;

export class WrappedFragment implements Fragment
{
	constructor(private readonly $content: WrappedFragmentContent, private readonly $before: string,
	            private readonly $after: string)
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

export class WrappedNewLineFragment extends WrappedFragment
{
	constructor(content: WrappedFragmentContent, before: string, after: string)
	{
		super(content, before + "\r\n", "\r\n" + after);
	}
}