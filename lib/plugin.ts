import {Page} from "./page";
import {buildMarkdown, isPage} from "./utils";
import {Context} from '@vuepress/types';
const glob = require('glob');

type PluginOptions = {
	pages: Array<Page>,
	entities: boolean
}

type AdditionalPages = {
	path: string,
	content: string,
	frontmatter: any
}

export default (options: PluginOptions, ctx: Context) =>
{
	
	const pages: Array<AdditionalPages> = [];
	
	if(options.entities === true)
	{
		glob(ctx.sourceDir + "/**/*.entity.json", {}, (err: any, matches: Array<any>) =>
		{
			console.log(matches);
		})
	}
	
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