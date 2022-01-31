import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {Bold, Link} from "../lib";
import {buildMarkdown} from "../lib/utils";

const assert = chai.assert;

@suite
class LinkTest
{
	@test 'simple'()
	{
		assert.equal(
			buildMarkdown([new Link('/folder/index.php', 'link')]),
			'[link](/folder/index.php)'
		);
	}
	@test 'emphasised text'()
	{
		assert.equal(
			buildMarkdown([new Link('/folder/index.php', [new Bold('link')])]),
			'[**link**](/folder/index.php)'
		);
	}
	
	@test 'emphasised link'()
	{
		assert.equal(
			buildMarkdown([new Bold(new Link('/folder/index.php', 'link'))]),
			'**[link](/folder/index.php)**'
		);
	}
}