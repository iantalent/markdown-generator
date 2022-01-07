import {FragmentsContainer} from "./fragment";
import {Page} from "./page";

export function isFragmentsContainer(pretender: any): pretender is FragmentsContainer
{
	return typeof pretender['tree'] === 'function';
}

export function isPage(pretender: any): pretender is Page
{
	return typeof pretender['path'] === 'function' &&
		typeof pretender['frontmatter'] === 'function' &&
		isFragmentsContainer(pretender);
}