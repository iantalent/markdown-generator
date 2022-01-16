const tsNode = require("ts-node");
const testTypeConfig = require("./tests/tsconfig.json");

tsNode.register({
	files: true,
	transpileOnly: true,
	project: './tests/tsconfig.json'
});