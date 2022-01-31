import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {
	Bold,
	BoldItalic,
	CodeBlock,
	Highlight,
	Italic,
	Paragraph,
	StrikeThrough,
	Subscript,
	Superscript,
} from "../lib";
import {buildMarkdown} from "../lib/utils";

const assert = chai.assert;

@suite
class EmphasisTest
{
	@test 'bold'()
	{
		assert.equal(buildMarkdown([new Bold('bold text')]), '**bold text**')
	}
	
	@test 'italic'()
	{
		assert.equal(buildMarkdown([new Italic('bold text')]), '*bold text*')
	}
	
	@test 'bold and italic'()
	{
		assert.equal(buildMarkdown([new BoldItalic('bold text')]), '***bold text***')
	}
	
	@test 'strikethrough'()
	{
		assert.equal(buildMarkdown([new StrikeThrough('message')]), '~~message~~');
	}
	
	@test 'paragraph with strikethrough'()
	{
		assert.equal(
			buildMarkdown([new Paragraph(new StrikeThrough('message 1'))]),
			'~~message 1~~'
		);
	}
	
	@test 'paragraphs with strikethrough'()
	{
		assert.equal(
			buildMarkdown([
				new Paragraph(new StrikeThrough('message 1')),
				new Paragraph(new StrikeThrough('message 2')),
			]),
			'~~message 1~~\r\n\r\n~~message 2~~'
		);
	}
	
	@test 'highlight'()
	{
		assert.equal(buildMarkdown([new Highlight('highlighted content')]), '==highlighted content==');
	}
	
	@test 'subscript'()
	{
		assert.equal(buildMarkdown(['H', new Subscript('2'), 'O']), 'H~2~O');
	}
	
	@test 'superscript'()
	{
		assert.equal(buildMarkdown(['X', new Superscript('2')]), 'X^2^');
	}
}