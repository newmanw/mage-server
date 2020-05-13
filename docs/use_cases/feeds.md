# Feeds Use Cases

Feeds are supplemental data sets that MAGE users can add to their active event context.  The user can select feeds to add from a list of feeds that an administrator has made available to participants of the event.  Feed content could have any combination of spatial, temporal, or informational dimensions.

## Background
Many MAGE customers have enterprise data sources available to them that are relevant to their particular mission domain and can aid users in the field.  For example, a disaster response team responding to an earthquake may desire to receive continuous updates about seismic activity in their operating area, including alerts and locations of detected tremors.  That data would originate from a service external to MAGE, but would be highly useful to incorporate directly in the responders' MAGE user experience.  The responder could then view the data without switching to another app, as well as see that data in the same context as their team's MAGE observations and team member locations.

## Notes
Some feeds may contain sensitive content and require some kind of authentication and authorization.  Sometimes this could even require clients to authenticate and fetch data directly from a feed endpoint,excluding the MAGE server, to support customer security requirements.

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
P1 is able to view the feed content in the context of the active event.  The content could be presented on the map and/or as a list of elements with various attributes and text, depending on the nature of the feed content.

### 2. Modify feed parameters

#### Summary
A partcipant user can modify fetch parameters of a feed to customize the content as desired.

#### Actors
1. Participant (P1)

### 2. Configure new feed

#### Actors
1. Administrator (A1)

#### Assumptions
1. A1 is an authenticated user with administrative privileges.

#### Main Flow
1. A1 requests to configure a new feed.
1. The app presents a list of registered feed types.
1. A1 selects the desired feed type.
1. The app presents the configuration options for the new feed.
   * This could include options such as the URL of a service endpoint, a
   fetch interval, maximum number of items to fetch, etc.
1. A1 changes the options as desired.
1. A1 requests a preivew of the feed data with the configured options.
1. The app begins fetching preview data from the feed service with the configured options.
1. The fetch completes and and the app presents the preview data.
1. A1 examines the preview and confirms the configuration options for the new feed.
1. The app stores the configuration for the new feed and prompts whether to add the feed to an event.
1. A1 requests to add the new feed to an event.
1. The app begins the `Assign feed to event` use case.

#### Result
The new feed configuration is saved and the feed is available to add to events.

#### Variations

##### Multi-Feed Services
As described above, multiple feeds could be availabe from a single service endpoint, for example, an OGC service that provides mutiple feature layers or collections, or a weather service that provides multiple alert streams.  Administrators' user experience might be better if the app allows to configure multiple feeds at once from a single service.  The steps might then change to allow the administrator to first enter the URL for a service endpoint, then fetch the list of feeds available for that service.  Further, the administrator might wish to make the enire service available as an aggregate, allowing the list of available feeds to change dynamically as the source service changes.  A service might configure itself such that it adds a new feed every month or every week.  Having to enable those new feeds through manual administration would be onerous.

### 3. Assign feed to event

### 4. Remove feed from event

### 5. Configure existing feed