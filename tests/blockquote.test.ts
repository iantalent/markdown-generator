import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {BlockQuote, Paragraph,} from "../lib";
import {buildMarkdown} from "../lib/utils";

const assert = chai.assert;

@suite
class BlockQuoteTest
{
	
	@test 'single'()
	{
		assert.equal(buildMarkdown([new BlockQuote('Quote')]), '> Quote');
	}
	
	@test 'double'()
	{
		assert.equal(buildMarkdown([new BlockQuote(['Quote', new BlockQuote('Sub quote')])]),
			'> Quote\r\n>\r\n>> Sub quote'
		);
	}
	
	@test 'double with paragraph'()
	{
		assert.equal(
			buildMarkdown(
				[new BlockQuote(['first', new BlockQuote('second'), new Paragraph('paragraph')])]
			),
			'> first\r\n>\r\n>> second\r\n>\r\n> paragraph'
		);
	}
	
	@test 'double with paragraph after'()
	{
		assert.equal(
			buildMarkdown(
				[new BlockQuote(['first', new BlockQuote('second')]), new Paragraph('paragraph')]
			),
			'> first\r\n>\r\n>> second\r\n\r\nparagraph'
		);
	}
	
	@test 'with new line'()
	{
		assert.equal(
			buildMarkdown([new BlockQuote('content\r\nsub content')]),
			'> content\r\n> sub content'
		);
	}
	
	@test 'sequence'()
	{
		assert.equal(
			buildMarkdown(
				[new BlockQuote('first'), new BlockQuote('second')]
			),
			'> first\r\n>\r\n> second'
		);
	}
	
	@test 'pragraph complex'()
	{
		assert.equal(
			buildMarkdown(
				[new BlockQuote([
					'start',
					new Paragraph('second'),
					new Paragraph('third'),
					new BlockQuote('fourth'),
					'six'
				])]
			),
			'> start\r\n>\r\n> second\r\n>\r\n> third\r\n>\r\n>> fourth\r\n>\r\n> six'
		);
	}
}