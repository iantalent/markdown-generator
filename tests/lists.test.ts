import {suite, test} from '@testdeck/mocha';
import * as chai from 'chai';
import {BlockQuote, OrderedList, Paragraph, TodoList, UnorderedList,} from "../lib";
import {buildMarkdown} from "../lib/utils";

const assert = chai.assert;

@suite
class ListsTest
{
	
	@test 'unordered'()
	{
		assert.equal(
			buildMarkdown([
				(new UnorderedList())
					.add('first')
					.add('second')
					.add('third')
			]),
			'- first\r\n- second\r\n- third'
		);
	}
	
	@test 'ordered'()
	{
		assert.equal(
			buildMarkdown([
				(new OrderedList())
					.add('first')
					.add('second')
					.add('third')
			]),
			'1. first\r\n2. second\r\n3. third'
		);
	}
	
	@test 'todo list'()
	{
		assert.equal(
			buildMarkdown([
				(new TodoList())
					.add(true, 'first')
					.add(false, 'second')
					.add(true, 'third')
			]),
			'[x] first\r\n[ ] second\r\n[x] third'
		);
	}
	
	@test 'single level with block level element'()
	{
		assert.equal(
			buildMarkdown([
				(new UnorderedList())
					.add('first')
					.add(['second', new Paragraph('paragraph')])
					.add('third')
			]),
			'- first\r\n- second\r\n\r\n\tparagraph\r\n\r\n- third'
		);
	}
	
	@test 'multilevel lists'()
	{
		assert.equal(
			buildMarkdown(
				[
					(new UnorderedList())
						.add('first')
						.add('second')
						.add('third')
						.add(
							(new OrderedList())
								.add('fourth')
								.add('fifth')
								.add('sixth')
								.add(
									(new TodoList())
										.add(true, 'seventh')
										.add(false, 'eighth')
										.add(true, 'ninth')
								)
						)
				]
			),
			'- first\r\n- second\r\n- third' +
			'\r\n\t1. fourth\r\n\t2. fifth\r\n\t3. sixth' +
			'\r\n\t\t[x] seventh\r\n\t\t[ ] eighth\r\n\t\t[x] ninth'
		);
	}
	
	@test 'lists with block quote'()
	{
		assert.equal(
			buildMarkdown([
				(new UnorderedList())
					.add('first')
					.add('second')
					.add(
						(new UnorderedList())
							.add('third')
							.add('fourth')
							.add(['six', new BlockQuote('quote')])
					)
					.add('seven')
			
			]),
			'- first\r\n- second\r\n\t- third\r\n\t- fourth\r\n\t- six\r\n\r\n\t\t> quote\r\n\r\n- seven'
		);
	}
}