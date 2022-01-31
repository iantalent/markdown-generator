import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {Bold, BoldItalic, Highlight, Italic, StrikeThrough, Subscript, Superscript,} from "../lib";
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