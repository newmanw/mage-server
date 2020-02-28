import _ from 'underscore';

class AdminLayerController {
  constructor($uibModal, $state, $stateParams, $filter, $timeout, Layer, Event, LocalStorageService, UserService) {
    this.$uibModal = $uibModal;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$filter = $filter;
    this.$timeout = $timeout;
    this.Layer = Layer;
    this.Event = Event;
    this.UserService = UserService;

    this.layerEvents = [];
    this.nonTeamEvents = [];
    this.eventsPage = 0;
    this.eventsPerPage = 10;
    this.status = {};

    this.hasLayerEditPermission = _.contains(UserService.myself.role.permissions, 'UPDATE_LAYER');
    this.hasLayerDeletePermission = _.contains(UserService.myself.role.permissions, 'DELETE_LAYER');

    this.fileUploadOptions = {
      acceptFileTypes: /(\.|\/)(kml)$/i,
      url: '/api/layers/' + $stateParams.layerId + '/kml?access_token=' + LocalStorageService.getToken(),
    };

    this.uploads = [{}];
    this.uploadConfirmed = false;

    // For some reason angular is not calling into filter function with correct context
    this.filterEvents = this._filterEvents.bind(this);
  }

  $onInit() {
    this.Layer.get({ id: this.$stateParams.layerId }, layer => {
      this.layer = layer;

      if (this.layer.unavailable) {
        this.$timeout(this.checkLayerProcessingStatus.bind(this), 1000);
      }

      this.Event.query(events => {
        this.event = {};
        this.layerEvents = _.filter(events, event => {
          return _.some(event.layers, layer => {
            return this.layer.id === layer.id;
          });
        });

        let nonLayerEvents = _.chain(events);
        if (!_.contains(this.UserService.myself.role.permissions, 'UPDATE_EVENT')) {
          // filter teams based on acl
          nonLayerEvents = nonLayerEvents.filter(event => {
            const permissions = event.acl[this.UserService.myself.id]
              ? event.acl[this.UserService.myself.id].permissions
              : [];
            return _.contains(permissions, 'update');
          });
        }

        nonLayerEvents = nonLayerEvents.reject(event => {
          return _.some(event.layers, layer => {
            return this.layer.id === layer.id;
          });
        });

        this.nonLayerEvents = nonLayerEvents.value();
      });
    });
  }

  _filterEvents(event) {
    const filteredEvents = this.$filter('filter')([event], this.eventSearch);
    return filteredEvents && filteredEvents.length;
  }

  addEventToLayer(event) {
    this.Event.addLayer({ id: event.id }, this.layer, event => {
      this.layerEvents.push(event);
      this.nonLayerEvents = _.reject(this.nonLayerEvents, e => {
        return e.id === event.id;
      });

      this.event = {};
    });
  }

  removeEventFromLayer($event, event) {
    $event.stopPropagation();

    this.Event.removeLayer({ id: event.id, layerId: this.layer.id }, event => {
      this.layerEvents = _.reject(this.layerEvents, e => {
        return e.id === event.id;
      });
      this.nonLayerEvents.push(event);
    });
  }

  editLayer(layer) {
    this.$state.go('admin.layerEdit', { layerId: layer.id });
  }

  gotoEvent(event) {
    this.state.go('admin.event', { eventId: event.id });
  }

  deleteLayer() {
    const modalInstance = this.$uibModal.open({
      resolve: {
        layer: () => {
          return this.layer;
        },
      },
      component: 'adminLayerDelete',
    });

    modalInstance.result.then(() => {
      this.$state.go('admin.layers');
    });
  }

  addUploadFile() {
    this.uploads.push({});
  }

  confirmUpload() {
    this.uploadConfirmed = true;
  }

  uploadComplete($event) {
    this.status[$event.id] = $event.response.files[0];
  }

  confirmCreateLayer() {
    console.log('create the layer anyway');
    this.Layer.makeAvailable({ id: this.$stateParams.layerId }, layer => {
      if (layer.processing) {
        this.layer.processing = layer.processing;
        this.$timeout(this.checkLayerProcessingStatus.bind(this), 1500);
      }
    });
  }

  checkLayerProcessingStatus() {
    this.Layer.get({ id: this.$stateParams.layerId }, layer => {
      this.layer = layer;
      if (layer.state === 'unavailable') {
        this.layer.processing = layer.processing;
        this.$timeout(this.checkLayerProcessingStatus.bind(this), 5000);
      } else {
        this.layer.processing = false;
      }
    });
  }
}

AdminLayerController.$inject = [
  '$uibModal',
  '$state',
  '$stateParams',
  '$filter',
  '$timeout',
  'Layer',
  'Event',
  'LocalStorageService',
  'UserService',
];

export default {
  template: require('./layer.html'),
  controller: AdminLayerController,
};
