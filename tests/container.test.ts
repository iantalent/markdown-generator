import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {SimpleFragmentsContainer,} from "../lib";
import {buildMarkdown} from "../lib/utils";

const assert = chai.assert;

@suite
class ContainerTest
{
	@test 'simple container'()
	{
		assert.equal(
			buildMarkdown(
				(new SimpleFragmentsContainer(', '))
					.add('First')
					.add('Second')
					.add('Third')
			),
			'First, Second, Third'
		)
	}
}