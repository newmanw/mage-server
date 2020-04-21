const path = require('path');
const express = require('express');
const { boot } = require('@ngageoint/mage.service/lib/app');

const webappPackage = require.resolve('@ngageoint/mage.web-app/package');
const webappDir = path.resolve(path.dirname(webappPackage), 'dist');
const plugins = require('./plugins');

// TODO: collect environment variables

boot({
  plugins
}).then(service => {
  service.app.use(express.static(webappDir));
  service.open();
});