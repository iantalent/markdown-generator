import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {Paragraph, SimpleFragment, SimplePage, Tip,} from "../lib";
import {buildMarkdown} from "../lib/utils";

const assert = chai.assert;

@suite class pluginTests {
	
	before() {
	
	}
	
	@test 'Simple Page'()
	{
		const page = new SimplePage("page title", "/path/");
		page.add(
			new SimpleFragment('some page data'),
			new Tip('You should go this way not that!'),
			new Paragraph('Some paragraph info')
		);
		console.log(buildMarkdown(page));
	}
	
	@test 'VuePress Builtin fragments'()
	{
		assert.equal(buildMarkdown([new Tip('Tip content')]), '::: tip\r\n\r\nTip content\r\n\r\n:::');
	}
	
	@test 'should do something when call a method'() {
		assert.isTrue(true);
	}
	
	
	
}