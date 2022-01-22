import {Fragment, FragmentContent} from "../fragment";

export class WrappedFragment implements Fragment
{
	content: Array<FragmentContent>;
	
	constructor(content: FragmentContent, before: string,
	            after: string)
	{
		this.content = [before, content, after]
	}
}

export class WrappedNewLineFragment extends WrappedFragment
{
	constructor(content: FragmentContent, before: string, after: string)
	{
		super(content, before + "\r\n\r\n", "\r\n\r\n" + after);
	}
}