'use strict';

module.exports.id = "feeds-admin-permissions";

const feedsPermissions = [
  'FEEDS_LIST_SERVICE_TYPES',
  'FEEDS_CREATE_SERVICE',
  'FEEDS_LIST_TOPICS',
  'FEEDS_CREATE_FEED',
]

module.exports.up = function (done) {
  // use this.db for MongoDB communication, and this.log() for logging
  const roles = this.db.collection('roles')
  roles.updateOne(
    { name: 'ADMIN_ROLE' },
    {
      $push: {
        permissions: {
          $each: feedsPermissions
        }
      }
    },
    done)
};

module.exports.down = function (done) {
  // use this.db for MongoDB communication, and this.log() for logging
  const roles = this.db.collection('roles')
  roles.updateOne(
    { name: 'ADMIN_ROLE' },
    {
      $pullAll: {
        permissions: feedsPermissions
      }
    },
    done)
};