import {WrappedNewLineFragment} from "./common";
import {blockLevelFragment, FragmentContent} from "../fragment";

@blockLevelFragment
export class Tip extends WrappedNewLineFragment
{
	constructor(content: FragmentContent, title: string = '')
	{
		super(content, '::: tip' + (title ? (' ' + title) : ''), ':::')
	}
}