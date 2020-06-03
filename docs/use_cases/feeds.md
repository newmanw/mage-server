# Feeds Use Cases

See the [Feeds section](../domain.md#feeds) in the domain document for a summary of the feeds concept.

## Notes
Some feeds may contain sensitive content and require some kind of authentication and authorization.  Sometimes this could even require clients to authenticate and fetch data directly from a feed endpoint, excluding the MAGE server, to support customer security requirements.

Feeds could be made available globally to all users of a particular MAGE instance, or restricted based on event membership, or perhaps even restricted to specific users.

Only administrators and event managers should have permission to create a feed and assign a feed to an event.  Event managers may only be able to create certain types of feeds and only assign feeds to events they manage, while administrators can create any type of feed and assign feeds to any event.

A single feed could be assigned to multiple events.

A feed implementation should be a plugin that can be deployed alongside core MAGE.  The feed plugin would implement an adapter interface that can fetch data from the feed service and transform the data to a format MAGE can present to the user.  A feed plugin could provide multiple feeds from a single source.  For example, an external service could provide several different data sets from a single API, such as NGA's Maritime Safety Information [ReST API](https://msi.nga.mil/api/swagger-ui.html).  A single plugin may also be able to communicate to many different sources, for example an RSS/GeoRSS/Atom feed plugin, or an OGC WFS plugin would be able to fetch data from any service implementing those specifications.  A feed plugin should register its feed implementations with core MAGE to make those implementations available for administrators to configure.

## Scenarios

### 1. Add feed to active event

#### Actors
1. Participant (P1)

#### Assumptions
1. P1 is an end user using a MAGE client to collect observations for an active event.
1. P1 is authenticated and has access to the active event.

#### Main Flow
1. P1 requests to add a feed to the active event.
1. The app presents a list of feeds available for the active event with brief summaries of their content.
1. P1 selects the desired feed.
1. The app begins fetching the feed content and presents an indication the feed content is loading.
1. The app indicates the fetch is complete and presents the fetched content of the feed.

#### Result
P1 is able to view the feed content in the context of the active event.  The app presents content with a geospatial dimension on the map, as well as in  a list of elements with various attributes and text, depending on the nature of the feed content.

### Modify feed parameters

#### Summary
A participant user can modify fetch parameters of a feed to customize the content as desired.

#### Actors
1. Participant (P1)

### Configure new feed service

#### Actors
1. Administrator (A1)

#### Assumptions
1. A1 is an authenticated user with administrative privileges

#### Main Flow
1. A1 requests to configure a new feed service.
1. The app presents a list of registered feed service types.
1. A1 selects the desired service type.
1. The app presents the configuration options for the new feed service.
   * Options for a feed service would generally include a URL the app will use to fetch feeds data from the feed service.
1. A1 changes the options as desired.
1. A1 requests to test the provided options by fetching data from the feed service.
1. The app presents the list of topics the feed service provides.
1. A1 confirms the new feed service.
1. The app presents a prompt asking A1 to configure new feeds from the service.
1. A1 requests to configure new feeds from the service.
1. The app begins the [`Configure new feed`](#configure-new-feed) flow assuming the selection of the newly configured feed service.

#### Result
The new feed service is saved and available to configure new feeds.

### Configure new feed

#### Actors
1. Administrator (A1)

#### Assumptions
1. A1 is an authenticated user with administrative privileges.

#### Main Flow
1. A1 requests to configure a new feed.
1. The app presents a list of registered feed services.
1. A1 selects the desired feed service.
1. The app presents the list of topics the feed service provides.
1. A1 selects the desired topic.
1. The app presents the options for the new feed grouped according to options that users cannot change and fetch parameters that users will be able to change when fetching data from the feed.
   * Potential options could be fetch interval, maximum number of items to fetch, maximum age of content, caching options, etc.
1. A1 changes the options as desired.
1. A1 requests a preview of the feed content with the configured options.
1. The app begins fetching preview content from the feed service with the configured options.
1. The fetch completes and the app presents the preview content.
1. A1 examines the preview and confirms the configuration options for the new feed.
1. The app stores the configuration for the new feed and prompts whether to add the feed to an event.
1. A1 requests to add the new feed to an event.
1. The app begins the `Assign feed to event` flow assuming the selection of the newly configured feed.

#### Result
The new feed configuration is saved and the feed is available to add to events.

#### Variations




### Assign feed to event

### Remove feed from event

### Configure existing feed