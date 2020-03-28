const mongoose = require('mongoose')
  , async = require('async')
  , RoleModel = mongoose.model('Role');

exports.id = 'event-manager-layer-create';

exports.up = function (done) {
  console.log('\nAdding update permission to EVENT_MANAGER_ROLE ...');

  async.series([
    function (done) {
      RoleModel.update({ name: 'EVENT_MANAGER_ROLE' }, { $push: { permissions: 'CREATE_LAYER' } }, done);
    },
    function (done) {
      RoleModel.update({ name: 'EVENT_MANAGER_ROLE' }, { $pullAll: { permissions: ['READ_TEAM', 'READ_LAYER_ALL'] } }, done);
    }
  ], function (err) {
    done(err);
  });

};

exports.down = function (done) {
  RoleModel.update({ name: 'EVENT_MANAGER_ROLE' }, { $pull: { permissions: 'CREATE_LAYER' } }, function (err) {
    done(err);
  });
};