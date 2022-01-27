import {WrappedNewLineFragment} from "./common";
import {ContentLevel, FragmentContent, FragmentLevel} from "../fragment";


export class Tip extends WrappedNewLineFragment implements FragmentLevel
{
	level: ContentLevel = ContentLevel.BLOCK;
	
	constructor(content: FragmentContent, title: string = '')
	{
		super(content, '::: tip' + (title ? (' ' + title) : ''), ':::')
	}
}