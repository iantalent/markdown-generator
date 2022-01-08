import {Page} from "./page";
import {buildMarkdown, isPage} from "./utils";

type PluginOptions = {
	pages: Array<Page>
}

type AdditionalPages = {
	path: string,
	content: string,
	frontmatter: any
}

export default (options: PluginOptions, ctx: object) =>
{
	const pages: Array<AdditionalPages> = [];
	
	if(Array.isArray(options['pages']) && options.pages.length)
	{
		for(const page of options.pages)
		{
			if(!isPage(page))
				throw new Error('There is wrong page item');
			
			pages.push({
				path: page.path(),
				content: buildMarkdown(page),
				frontmatter: page.frontmatter()
			});
		}
	}
	
	return {
		name: 'custom-pages-plugin',
		additionalPages: pages
	};
}