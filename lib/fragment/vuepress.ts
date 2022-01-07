import {WrappedFragment, WrappedFragmentContent, WrappedNewLineFragment} from "./common";

export class Tip extends WrappedNewLineFragment
{
	constructor(content: WrappedFragmentContent, title: string = '')
	{
		super(content, '::: tip ' + (title || ''), ':::')
	}
}