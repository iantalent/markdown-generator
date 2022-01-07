import {SimplePage} from "./page";
import {SimpleFragment, buildMarkdown} from "./fragment";
import {Heading} from "./fragment/builtin";

export default (options: object, ctx: object) =>
{
	console.log(options, ctx);
	const testPage = (new SimplePage('Test Page title', '/test-page/'))
		.add(new Heading('Sub title', 2));
	
	return {
		name: 'custom-pages-plugin',
		additionalPages: [
			{
				path: testPage.path(),
				content: buildMarkdown(testPage)
			}
		]
	};
}