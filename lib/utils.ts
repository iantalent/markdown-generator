import {FragmentsContainer, FragmentsContainerEntry} from "./container";
import {Fragment} from "./fragment";
import {MarkdownBuilder} from "./builder";

export function isFragmentsContainer(container: any): container is FragmentsContainer
{
	return typeof container['tree'] === 'function';
}

export function isFragment(fragment: any): fragment is Fragment
{
	return ['string', 'function'].indexOf(typeof fragment['content']) !== -1 ||
		Array.isArray(fragment['content'])
		|| isFragment(fragment['content']);
}

/**
 * @param {FragmentsContainer} container
 * @returns {string}
 */
export function buildMarkdown(container: FragmentsContainer | Array<FragmentsContainerEntry>): string
{
	return MarkdownBuilder.build(container);
}
