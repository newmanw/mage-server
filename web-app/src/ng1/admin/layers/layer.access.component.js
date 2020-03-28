import _ from 'underscore';

class AdminLayerAccessController {
  constructor($state, $stateParams, $q, $filter, Layer, LayerAccess, UserService) {
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$q = $q;
    this.$filter = $filter;
    this.Layer = Layer;
    this.LayerAccess = LayerAccess;
    this.UserService = UserService;

    this.users = [];

    this.member = {};
  
    this.roles = [{
      name: 'GUEST',
      title: 'Guest',
      description: 'Read only access to this layer.'
    },{
      name: 'MANAGER',
      title: 'Manager',
      description: 'Read and Update access to this layer.'
    },{
      name: 'OWNER',
      title: 'Owner',
      description: 'Read, Update and Delete access to this layer.'
    }];

    // For some reason angular is not calling into filter function with correct context
    this.filterMembers = this._filterMembers.bind(this);  
  }

  $onInit() {
    this.$q.all({users: this.UserService.getAllUsers(), layer: this.Layer.get({id: this.$stateParams.layerId}).$promise}).then(result => {
      this.users = result.users;
  
      this.role = {
        selected: this.roles[0]
      };
  
      this.refreshMembers(result.layer);
    });
  }

  _filterMembers(member) {
    const filteredMembers = this.$filter('filter')([member], this.memberSearch);
    return filteredMembers && filteredMembers.length;
  }

  refreshMembers(layer) {
    this.layer = layer;

    const usersById = _.indexBy(this.users, 'id');

    this.layerMembers = _.map(this.layer.acl, (access, userId) => {
      const member = _.pick(usersById[userId], 'displayName', 'avatarUrl', 'lastUpdated');
      member.id = userId;
      member.role = {
        selected: _.find(this.roles, role => { return role.name === access.role; })
      };

      return member;
    });

    this.nonMembers = _.reject(this.users, user => {
      return _.where(this.layerMembers, {id: user.id}).length > 0;
    });

    this.owners = this.getOwners();
  }

  getOwners() {
    return _.filter(this.layerMembers, member => {
      return member.role.selected.name === 'OWNER';
    });
  }

  addMember(member, role) {
    this.LayerAccess.update({
      layerId: this.layer.id,
      userId: member.id,
      role: role.name
    }, layer => {
      delete this.member.selected;
      this.refreshMembers(layer);
    });
  }

  removeMember(member) {
    this.LayerAccess.delete({
      layerId: this.layer.id,
      userId: member.id
    }, layer => {
      this.refreshMembers(layer);
    });
  }

  updateRole(member, role) {
    this.LayerAccess.update({
      layerId: this.layer.id,
      userId: member.id,
      role: role.name
    }, layer => {
      this.refreshMembers(layer);
    });
  }

  gotoUser(member) {
    this.$state.go('admin.user', { userId: member.id });
  }
}

AdminLayerAccessController.$inject = ['$state', '$stateParams', '$q', '$filter', 'Layer', 'LayerAccess', 'UserService'];

export default {
  template: require('./layer.access.html'),
  controller: AdminLayerAccessController
};