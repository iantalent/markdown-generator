import {FragmentsContainer, FragmentsList} from "./container";
import {Heading} from "./fragment";

export interface Page extends FragmentsContainer
{
	path(): string
	
	frontmatter(): any
}

export class SimplePage implements Page
{
	private readonly fragments: FragmentsList = [];
	
	constructor(private readonly $name: string, private readonly $path: string, private readonly $frontmatter = {})
	{
		this.fragments.push(new Heading(this.$name, 1));
	}
	
	tree(): FragmentsList
	{
		return this.fragments;
	}
	
	add(...entries: FragmentsList): this
	{
		if(entries && entries.length)
		{
			for(const entry of entries)
				this.fragments.push(entry);
		}
		return this;
	}
	
	name(): string
	{
		return this.$name;
	}
	
	path(): string
	{
		return this.$path
	}
	
	frontmatter()
	{
		return this.$frontmatter;
	}
}