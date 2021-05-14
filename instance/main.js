const path = require('path');
const express = require('express');
const { boot } = require('@ngageoint/mage.service/lib/app');

const webappPackagePath = require.resolve('@ngageoint/mage.web-app/package.json');
const webappDir = path.dirname(webappPackagePath);
const config = require('./plugins.json');

// TODO: collect environment variables

boot(config).then(service => {
  service.app.use(express.static(webappDir));
  service.open();
});