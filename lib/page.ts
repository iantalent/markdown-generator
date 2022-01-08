import {RootContainer} from "./container";
import {Heading} from "./fragment";

export interface Page
{
	path(): string
	
	frontmatter(): any
	
	tree() : RootContainer
}

export class SimplePage implements Page
{
	private readonly $container = new RootContainer();
	
	constructor(private readonly $name: string, private readonly $path: string, private readonly $frontmatter = {})
	{
		this.$container.add(new Heading(this.$name, 1));
	}
	
	tree(): RootContainer
	{
		return this.$container;
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