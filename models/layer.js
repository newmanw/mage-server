const mongoose = require('mongoose'),
  Event = require('./event'),
  log = require('winston');

const permissions = {
  OWNER: ['read', 'update', 'delete'],
  MANAGER: ['read', 'update'],
  GUEST: ['read']
};

// Creates a new Mongoose Schema object
const Schema = mongoose.Schema;

// Creates the Schema for the Attachments object
const LayerSchema = new Schema({
  _id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String, required: false },
  state: { type: String, required: true, enum: ['available', 'unavailable', 'processing'] },
  acl: {}
},{
  discriminatorKey: 'type',
});

const ImagerySchema = new Schema({
  url: { type: String, required: false },
  base: { type: Boolean, required: false },
  format: { type: String, required: false },
  wms: {
    layers: { type: String },
    styles: { type: String },
    format: { type: String },
    transparent: { type: Boolean },
    version: { type: String }
  }
});

const FeatureSchema = new Schema({
  collectionName: { type: String, required: false }
});

const GeoPackageSchema = new Schema({
  file: {
    name: { type: String, required: false },
    contentType: { type: String, required: false },
    size: { type: String, required: false },
    relativePath: { type: String, required: false }
  },
  tables: [{
    _id: false,
    name: { type: String },
    type: { type: String, enum: ['tile', 'feature'] },
    minZoom: { type: Number },
    maxZoom: { type: Number },
    bbox: [{
      type: Number
    }]
  }],
  invalid: {
    type: {
      errors: [Schema.Types.Mixed]
    },
    default: undefined
  },
  processing: {
    type: [{
      _id: false,
      count: { type: Number, required: false },
      total: { type: Number, required: false },
      description: { type: String, required: false },
      layer: { type: String, required: true },
      type: { type: String, enum: ['tile', 'feature'] },
      complete: { type: Boolean }
    }],
    default: undefined
  }
});

function rolesWithPermission(permission) {
  const roles = [];

  for (const key in permissions) {
    if (permissions[key].indexOf(permission) !== -1) {
      roles.push(key);
    }
  }

  return roles;
}

function userHasLayerPermission(layer, userId, permission) {
  // Check if user has permission in layer acl
  return (layer.acl[userId] && rolesWithPermission(permission).some(function (role) { return role === layer.acl[userId]; }));
}

function transform(layer, ret, options) {
  ret.id = ret._id;
  delete ret._id;
  delete ret.collectionName;
  const path = options.path || '';
  if (ret.type === 'Feature') ret.url = path;

  // if read only permissions in layer acl, only return users acl
  if (options.access) {
    const userAccess = ret.acl[options.access.user._id];
    const roles = rolesWithPermission('update').concat(rolesWithPermission('delete'));
    if (!userAccess || roles.indexOf(userAccess) === -1) {
      const acl = {};
      acl[options.access.user._id] = ret.acl[options.access.user._id];
      ret.acl = acl;
    }
  }

  for (const userId in ret.acl) {
    ret.acl[userId] = {
      role: ret.acl[userId],
      permissions: permissions[ret.acl[userId]]
    };
  }
}

LayerSchema.set('toObject', {
  transform: transform
});

LayerSchema.set('toJSON', {
  transform: transform
});

// Validate the layer before save
LayerSchema.pre('save', function(next) {
  //TODO validate layer before save
  next();
});

LayerSchema.pre('remove', function(next) {
  const layer = this;

  Event.removeLayerFromEvents(layer, next);
});

// Creates the Model for the Layer Schema
const Layer = mongoose.model('Layer', LayerSchema);
exports.Model = Layer;
exports.userHasLayerPermission = userHasLayerPermission;


const ImageryLayer = Layer.discriminator('Imagery', ImagerySchema);
const FeatureLayer = Layer.discriminator('Feature', FeatureSchema);
const GeoPackageLayer = Layer.discriminator('GeoPackage', GeoPackageSchema);

exports.getLayers = function(options) {
  const filter = options.filter;
  const conditions = {};
  if (filter.type) conditions.type = filter.type;
  if (filter.layerIds) conditions._id = { $in: filter.layerIds };
  if (!filter.includeUnavailable) {
    conditions.state = { $eq: 'available' };
  }

  if (options.access) {
    const accesses = [];
    rolesWithPermission(options.access.permission).forEach(function (role) {
      const access = {};
      access['acl.' + options.access.user._id.toString()] = role;
      accesses.push(access);
    });

    conditions['$or'] = accesses;
  }

  return Layer.find(conditions).exec();
};

exports.count = function (options) {
  options = options || {};

  const conditions = {};
  if (options.access) {
    const accesses = [];
    rolesWithPermission(options.access.permission).forEach(function (role) {
      const access = {};
      access['acl.' + options.access.user._id.toString()] = role;
      accesses.push(access);
    });

    conditions['$or'] = accesses;
  }

  return Layer.count(conditions).exec();
};

exports.getById = function(id, options) {
  const conditions = {
    _id: id
  };

  if (options.access) {
    const accesses = [];
    rolesWithPermission(options.access.permission).forEach(function (role) {
      const access = {};
      access['acl.' + options.access.user._id.toString()] = role;
      accesses.push(access);
    });

    conditions['$or'] = accesses;
  }

  console.log('find one w/ conditions', conditions);

  return Layer.findOne(conditions).exec();
};

exports.createFeatureCollection = function(name) {
  return mongoose.connection.db.createCollection(name).then(function() {
    log.info('Successfully created feature collection for layer ' + name);
  });
};

exports.dropFeatureCollection = function(layer) {
  return mongoose.connection.db.dropCollection(layer.collectionName).then(function() {
    log.info('Dropped collection ' + layer.collectionName);
  });
};

exports.create = function(id, layer, user) {
  layer._id = id;
  layer.acl = {};
  layer.acl[user._id.toString()] = 'OWNER';
  return Layer.create(layer);
};

exports.update = function(id, layer) {
  // remove acl property
  const { acl, ...update} = layer;

  let model;
  switch (layer.type) {
    case 'Imagery':
      model = ImageryLayer;
      break;
    case 'Feature':
      model = FeatureLayer;
      break;
    case 'GeoPackage':
      model = GeoPackageLayer;
      break;
  }

  return model.findByIdAndUpdate(id, update, { new: true }).exec();
};

exports.updateUserInAcl = function (layerId, userId, role, callback) {
  // validate userId
  let err;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    err = new Error('Invalid userId');
    err.status = 400;
    return callback(err);
  }

  // validate role
  if (Object.keys(permissions).indexOf(role) === -1) {
    err = new Error('Invalid role');
    err.status = 400;
    return callback(err);
  }

  const update = {};
  update['acl.' + userId] = role;

  Layer.findOneAndUpdate({ _id: layerId }, update, { new: true, runValidators: true }, callback);
};

exports.removeUserFromAcl = function (layerId, userId, callback) {
  const update = {
    $unset: {}
  };
  update.$unset['acl.' + userId] = true;

  Layer.findByIdAndUpdate(layerId, update, { new: true, runValidators: true }, callback);
};

exports.removeUserFromAllAcls = function (user, callback) {
  const update = {
    $unset: {}
  };
  update.$unset['acl.' + user._id.toString()] = true;

  Layer.update({}, update, { multi: true, new: true }, callback);
};

exports.remove = function(layer) {
  return layer.remove();
};
