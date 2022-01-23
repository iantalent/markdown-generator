import {FragmentsContainer, FragmentsContainerEntry} from "./container";
import {Page} from "./page";
import {Fragment} from "./fragment";
import {MarkdownBuilder} from "./builder";

export function isFragmentsContainer(container: any): container is FragmentsContainer
{
	return typeof container['tree'] === 'function';
}

export function isPage(page: any): page is Page
{
	return typeof page['path'] === 'function' &&
		typeof page['frontmatter'] === 'function' &&
		isFragmentsContainer(page);
}

export function isFragment(fragment: any): fragment is Fragment
{
	return ['string', 'function'].indexOf(typeof fragment['content']) !== -1 ||
		Array.isArray(fragment['content'])
		|| isFragment(fragment['content']);
}

/**
 * @param {FragmentsContainer|Page} container
 * @returns {string}
 */
export function buildMarkdown(container: FragmentsContainer | Page | Array<FragmentsContainerEntry>): string
{
	return MarkdownBuilder.build(container);
}
