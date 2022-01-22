import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {BlockQuote, Bold, Code, Italic, Paragraph, SimpleFragment, SimplePage, Tip,} from "../lib";
import {buildMarkdown} from "../lib/utils";

const assert = chai.assert;

@suite
class pageFragments
{
	
	before()
	{
	
	}
	
	@test 'Simple Page'()
	{
		const page = new SimplePage("title", "/path/");
		page.add(
			new SimpleFragment('simple fragment'),
			new Paragraph(['Paragraph 1 ', new Bold('bold')]),
			new Paragraph(new Italic('Italic text')),
			new Paragraph(new Code('Boolean')),
			new Tip('You should go this way not that!'),
			new Paragraph('Some paragraph info')
		);
		assert.equal(buildMarkdown(page), '# title\r\n\r\n' +
			'simple fragment\r\n\r\n' +
			'Paragraph 1 **bold**\r\n\r\n' +
			'*Italic text*\r\n\r\n' +
			'`Boolean`\r\n\r\n' +
			'::: tip\r\n\r\nYou should go this way not that!\r\n\r\n:::\r\n\r\n' +
			'Some paragraph info');
	}
	
	@test 'BlockQuote'()
	{
		assert.equal(buildMarkdown([new BlockQuote('Quote')]), '> Quote');
		console.log(buildMarkdown([new BlockQuote(['Quote 1', new BlockQuote('Sub quote 2')])]));
		assert.equal(buildMarkdown([new BlockQuote(['Quote', new BlockQuote('Sub quote')])]),
			'> Quote\r\n\r\n>> Sub quote'
		);
	}
	
	@test 'VuePress Builtin fragments'()
	{
		assert.equal(buildMarkdown([new Tip('Tip content')]), '::: tip\r\n\r\nTip content\r\n\r\n:::');
	}
}