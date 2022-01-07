import {FragmentsContainer, FragmentsContainerEntry, FragmentsList, SimpleFragmentsContainer} from "./fragment";
import {Heading} from "./fragment/builtin";

export interface Page extends FragmentsContainer
{
	name(): string
	
	path(): string
	
	frontmatter(): any
}

export class SimplePage implements Page
{
	private readonly $container = new SimpleFragmentsContainer();
	
	constructor(private readonly $name: string, private readonly $path: string, private readonly $frontmatter = {})
	{
		this.$container.add(new Heading(this.$name, 1));
	}
	
	tree(): FragmentsList
	{
		return this.$container.tree();
	}
	
	add(entry: FragmentsContainerEntry)
	{
		this.$container.add(entry);
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