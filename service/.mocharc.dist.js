
module.exports = {
  spec: 'test-lib/**/*.js',
  require: [
    require.resolve('iconv-lite/encodings'),
    require.resolve('mock-fs'),
    require.resolve('./test/test_env'),
  ],
};