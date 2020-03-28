var FeatureModel = require('../models/feature');

class Feature {
  constructor(layer) {
    this._layer = layer;
  }

  getAll(options) {
    return FeatureModel.getFeatures(this._layer, options);
  }

  createFeatures(features) {
    return FeatureModel.createFeatures(this._layer, features);
  }
}

module.exports = Feature;
