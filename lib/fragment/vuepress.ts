import {WrappedFragmentContent, WrappedNewLineFragment} from "./common";
import {blockLevelFragment} from "../fragment";

@blockLevelFragment
export class Tip extends WrappedNewLineFragment
{
	constructor(content: WrappedFragmentContent, title: string = '')
	{
		super(content, '::: tip' + (title ? (' ' + title) : ''), ':::')
	}
}