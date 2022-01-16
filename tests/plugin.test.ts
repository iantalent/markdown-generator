import { suite, test } from '@testdeck/mocha';
import * as chai from 'chai';
import {plugin, SimplePage, } from "../lib";

const assert = chai.assert;

@suite class pluginTests {
	
	before() {
	
	}
	
	@test 'Simple Page'()
	{
		const page = new SimplePage("page title", "/path/");
		
	}
	
	@test 'should do something when call a method'() {
		assert.isTrue(true);
	}
	
	
	
}