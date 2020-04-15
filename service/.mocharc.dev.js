
/*
run the test typescript directly with ts-node instead of the compiled js
*/
const base = require('./.mocharc.dist');
const dev = {
  ...base,
  spec: './test/**/*.@(js|ts)'
};
dev.require.unshift(require.resolve('ts-node/register'))
module.exports = dev;
