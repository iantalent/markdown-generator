import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {
	BlockQuote,
	Bold,
	Code,
	CodeBlock, Emoji, Highlight,
	Italic, Link,
	Paragraph,
	SimpleFragment,
	SimplePage,
	StrikeThrough, Subscript, Superscript,
	Tip,
} from "../lib";
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
			{content: 'Simple fragment'},
			{content: 'Simple fragment 2'},
			new Tip('You should go this way not that!'),
			new BlockQuote([
				'quote 1', new Paragraph('paragraph'),
				new BlockQuote([
					'quote 2', new Paragraph('paragraph 2'),
					new BlockQuote(['quote 3', new Paragraph('paragraph 3')])
				])
			]),
			new Paragraph('Some paragraph info')
		);
		assert.equal(buildMarkdown(page), '# title\r\n\r\n' +
			'simple fragment\r\n\r\n' +
			'Paragraph 1 **bold**\r\n\r\n' +
			'*Italic text*\r\n\r\n' +
			'`Boolean`\r\n\r\n' +
			'Simple fragmentSimple fragment 2\r\n\r\n' +
			'::: tip\r\n\r\nYou should go this way not that!\r\n\r\n:::\r\n\r\n' +
			'> quote 1\r\n>\r\n> paragraph\r\n>\r\n>> quote 2\r\n>>\r\n>> paragraph 2\r\n>>\r\n>>> quote 3\r\n>>>\r\n>>> paragraph 3\r\n\r\n' +
			'Some paragraph info');
	}
	
	@test 'BlockQuote'()
	{
		assert.equal(buildMarkdown([new BlockQuote('Quote')]), '> Quote');
		assert.equal(buildMarkdown([new BlockQuote(['Quote', new BlockQuote('Sub quote')])]),
			'> Quote\r\n>\r\n>> Sub quote'
		);
		assert.equal(
			buildMarkdown([new BlockQuote('content\r\nsub content')]),
			'> content\r\n> sub content'
		);
	}
	
	@test 'CodeBlock'()
	{
		assert.equal(
			buildMarkdown([new CodeBlock('var test = "lang";\r\nconsole.log(test);', 'js')]),
			'```js\r\n\r\nvar test = "lang";\r\nconsole.log(test);\r\n\r\n```'
		);
	}
	
	@test 'Strikethrough'()
	{
		assert.equal(buildMarkdown([new StrikeThrough('message')]), '~~message~~');
		assert.equal(
			buildMarkdown([
				new Paragraph(new StrikeThrough('message 1')),
				new Paragraph(new StrikeThrough('message 2')),
			]),
			'~~message 1~~\r\n\r\n~~message 2~~'
		);
	}
	
	@test 'links'()
	{
		assert.equal(
			buildMarkdown([new Link('/folder/index.php', 'link')]),
			'[link](/folder/index.php)'
		);
		assert.equal(
			buildMarkdown([new Link('/folder/index.php', ['text ', new Bold('link')])]),
			'[text **link**](/folder/index.php)'
		);
		assert.equal(
			buildMarkdown([new Italic(new Link('/folder/index.php', 'link'))]),
			'*[link](/folder/index.php)*'
		);
	}
	
	@test 'Emoji'()
	{
		assert.equal(buildMarkdown([new Emoji('joy')]), ':joy:');
		assert.equal(buildMarkdown([new Emoji('tent')]), ':tent:');
	}
	
	@test 'Highlight'()
	{
		assert.equal(buildMarkdown([new Highlight('highlighted content')]), '==highlighted content==');
	}
	
	@test 'Subscript and Superscript'()
	{
		assert.equal(buildMarkdown(['H', new Subscript('2'), 'O']), 'H~2~O');
		assert.equal(buildMarkdown(['X', new Superscript('2')]), 'X^2^');
	}
	
	@test 'VuePress Builtin fragments'()
	{
		assert.equal(buildMarkdown([new Tip('Tip content')]), '::: tip\r\n\r\nTip content\r\n\r\n:::');
	}
}