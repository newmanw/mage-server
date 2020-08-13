const _ = require('underscore')
  , moment = require('moment')
  , FeedAction = require('../../app/feed/feed-item/feed-item.service').FeedAction;

module.exports = NewsFeed;

function NewsFeed() {
  const directive = {
    restrict: "A",
    template:  require('./feed.directive.html'),
    scope: {
      event: '=',
      addObservation: '=',
      feedUsersChanged: '=',
      onToggleFeed: '&'
    },
    controller: NewsFeedController
  };

  return directive;
}

NewsFeedController.$inject = ['$scope', 'MapService', 'EventService', 'ObservationService', 'FilterService', 'UserService', 'FeedService', 'FeedItemService', 'Observation', '$uibModal'];

function NewsFeedController($scope, MapService, EventService, ObservationService, FilterService, UserService, FeedService, FeedItemService, Observation, $uibModal) {

  const tabs = [{
    id: 'observations',
    title: 'Observations',
    icon: 'place'
  }, {
    id: 'people',
    title: 'People',
    icon: 'people'
  }];

  $scope.tabs = tabs.slice();
  $scope.tab = $scope.tabs[0];

  $scope.onTabSwitched = function(tab) {
    $scope.tab = tab;

    $scope.newObservation = null;
    $scope.editObservation = null;
    $scope.viewObservation = null;
    $scope.viewUser = null;
    $scope.feedItem = null;
  };

  FeedService.feeds.subscribe(feeds => onFeedsChanged(feeds));
  FeedItemService.item$.subscribe(event => onFeedItemEvent(event));

  var newObservation;

  $scope.createObservation = function(form) {
    delete $scope.newObservationForms;
    $scope.newObservation = newObservation;

    $scope.newObservationForm = {
      geometryField: {
        title: 'Location',
        type: 'geometry',
        name: 'geometry',
        value: newObservation.geometry
      },
      timestampField: {
        title: 'Date',
        type: 'date',
        name:'timestamp',
        value: moment(newObservation.properties.timestamp).toDate()
      },
      forms: []
    };

    if (form) {
      var observationForm = EventService.createForm(newObservation, form);
      observationForm.name = form.name;
      $scope.newObservationForm.forms.push(observationForm);
    }

  };

  $scope.cancelNewObservation = function() {
    delete $scope.newObservationForms;
  }

  $scope.$on('user:view', function(e, user) {
    $scope.viewUser = user;
    $scope.newObservation = null;
    $scope.editObservation = null;
    $scope.viewObservation = null;
    $scope.feedItem = null;

    $scope.onToggleFeed({
      $event: {
        hidden: false
      }
    });
  });

  $scope.$on('user:viewDone', function() {
    MapService.deselectFeatureInLayer($scope.viewUser, 'people');
    $scope.viewUser = null;
  });

  $scope.$on('observation:view', function(e, observation) {
    $scope.viewObservation = observation;
    $scope.newObservation = null;
    $scope.editObservation = null;
    $scope.viewUser = null;
    $scope.feedItem = null;

    $scope.onToggleFeed({
      $event: {
        hidden: false
      }
    });
  });

  $scope.$on('observation:viewDone', function() {
    MapService.deselectFeatureInLayer($scope.viewObservation, 'observations');
    $scope.viewObservation = null;
  });

  $scope.$on('observation:edit', function(e, observation) {
    $scope.edit = true;

    var formMap = _.indexBy(EventService.getForms(observation), 'id');
    var form = {
      geometryField: {
        title: 'Location',
        type: 'geometry',
        name: 'geometry',
        value: observation.geometry
      },
      timestampField: {
        title: 'Date',
        type: 'date',
        name: 'timestamp',
        value: moment(observation.properties.timestamp).toDate()
      },
      forms: []
    };

    _.each(observation.properties.forms, function(propertyForm) {
      var observationForm = EventService.createForm(observation, formMap[propertyForm.formId]);
      observationForm.name = formMap[propertyForm.formId].name;
      form.forms.push(observationForm);
    });

    $scope.editForm = form;
    $scope.editObservation = observation;
  });

  function createNewObservation($event) {
    var event = FilterService.getEvent();
    if (!EventService.isUserInEvent(UserService.myself, event)) {
      $uibModal.open({
        template: require('../error/not.in.event.html'),
        controller: 'NotInEventController',
        resolve: {
          title: function() {
            return 'Cannot Create Observation';
          }
        }
      });

      return;
    }

    newObservation = new Observation({
      id: 'new',
      eventId: event.id,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [$event.latLng.lng, $event.latLng.lat]
      },
      properties: {
        timestamp: new Date(),
        forms: []
      }
    });

    var newObservationForms = EventService.getForms(newObservation, {archived: false});
    newObservation.style = {
      iconUrl: getIconUrl(event, newObservationForms)
    };

    if (newObservationForms.length === 0) {
      $scope.createObservation();
    } else if (newObservationForms.length === 1) {
      $scope.createObservation(newObservationForms[0]);
    } else {
      $scope.newObservationForms = newObservationForms;
    }
  };

  function getIconUrl(event, forms) {
    const primaryForm = forms.length ? forms[0] : {};
    const fields = forms.length ? forms[0].fields : [];
    var primary = _.find(fields, function(field) {
      return field.name === primaryForm.primaryField;
    }) || {};

    var secondary = _.find(fields, function(field) {
      return field.name === primaryForm.variantField;
    }) || {};

    return ObservationService.getObservationIconUrlForEvent(event.id, primaryForm.id, primary.value, secondary.value);
  }

  function onFeedsChanged(feeds) {
    $scope.tabs = tabs.concat(_.map(feeds, feed => {
      const style = feed.mapStyle || {}
      return {
        id: `feed-${feed.id}`,
        title: feed.title,
        iconUrl: style.iconUrl,
        feed: feed
      };
    }))
  }

  $scope.onFormClose = function() {
    $scope.newObservation = null;
    $scope.editObservation = null;
  }

  $scope.onObservationDelete = function($event) {
    $scope.newObservation = null;
    $scope.editObservation = null;
    $scope.viewObservation = null;
    MapService.removeFeatureFromLayer($event.observation, 'observations');
  }

  $scope.$watch('event', function(event) {
    $scope.newObservation = null;
    $scope.editObservation = null;
    $scope.viewObservation = null;
    $scope.viewUser = null;
    $scope.feedItem = null;
  });

  $scope.$watch('currentFeedPanel', function(currentFeedPanel) {
    if (currentFeedPanel === 'observations') {
      $scope.observationsChanged = 0;
      $scope.$broadcast('map:visible');
    } else if (currentFeedPanel === 'people') {
      $scope.feedUsersChanged = {};
      $scope.usersChanged = 0;
    }
  });

  $scope.$watch('addObservation', function($event) {
    if (!$event) return;

    // Don't allow new observation if observation create is in progress
    if ($scope.newObservation || $scope.newObservationForms) return;

    createNewObservation($event);
  });

  $scope.$watch('feedObservationsChanged', function(feedObservationsChanged) {
    if (!feedObservationsChanged) return;

    if ($scope.currentFeedPanel === 'people') {
      $scope.observationsChanged = feedObservationsChanged.count;
    }
  }, true);

  $scope.$watch('feedUsersChanged', function(feedUsersChanged) {
    if (!feedUsersChanged) return;

    if ($scope.currentFeedPanel === 'observations') {
      $scope.usersChanged = _.keys(feedUsersChanged).length;
    }
  }, true);

  $scope.$on('user:select', function(e, user) {
    $scope.viewUser = user;
    $scope.viewObservation = null;
    $scope.editObservation = null;
    $scope.newObservation = null;
    $scope.feedItem = null;

    $scope.onToggleFeed({
      $event: {
        hidden: false
      }
    });
  });

  $scope.$on('item:view', function (e, item) {
    $scope.feedItem = item;
    $scope.viewObservation = null;
    $scope.newObservation = null;
    $scope.editObservation = null;
    $scope.viewUser = null;

    $scope.onToggleFeed({
      $event: {
        hidden: false
      }
    });
  });

  function onFeedItemEvent(event) {
    if (event.action == FeedAction.Select) {
      $scope.feedItem = {
        feed: event.feed,
        item: event.item
      };
    } else {
      $scope.feedItem = null;
    }

    $scope.$apply();
  }
}
