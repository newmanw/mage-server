
/*
run the test typescript directly with ts-node instead of the compiled js
*/
const base = require('./.mocharc.dist');
const dev = {
  ...base,
  spec: './test/**/*.@(js|ts)',
  ignore: './test/@types.test/**/*'
};

dev.require.unshift(require.resolve('./test_ts-node'))

module.exports = dev;
