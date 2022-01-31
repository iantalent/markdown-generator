import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {CodeBlock,} from "../lib";
import {buildMarkdown} from "../lib/utils";

const assert = chai.assert;

@suite
class CodeBlockTest
{
	@test 'javascript'()
	{
		assert.equal(
			buildMarkdown([new CodeBlock('var test = "lang";\r\nconsole.log(test);', 'js')]),
			'```js\r\n\r\nvar test = "lang";\r\nconsole.log(test);\r\n\r\n```'
		);
	}
}