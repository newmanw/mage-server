# MAGE Application Domain

## Goals

### Situational Awareness
The primary goal of MAGE is to facilitate situational awareness for teams during an event or coordinated operation.  MAGE enables event participants in the field to capture geotagged, timestamped data, called observations, about subjects of interest.  As field users capture and submit observations, MAGE immediately shares them with all other event participants.  To make data capture easy and accurate, MAGE provides customizable data entry forms with fields to describe subjects relevant to a particular customer's domain.  To enrich the custom form data, users can attach media, including photos, videos, and audio, using mobile devices and immediately share the data with other event participants.  MAGE includes an optional to track and report the locations of event participants using mobile devices in the field so all participants can know each other's current location.  MAGE displays the observations and locations of all participants on a map on the participants' mobile devices.  Non-field participants, such as administrators, event coordinators, or monitors, can also view the observations and locations of participants on a map using a desktop computer or laptop.  Users can use this desktop view as a dashboard that displays event observations and locations as they change.  Event participants can also use the dashboard to create or modify observations as they occur or later during analysis.

### Disconnected Data Collection
Another goal of MAGE is to enable field users without connectivity to continue collecting data on a mobile device, then automatically synchronize the collected data when connectivity is again available.  In some situations, field users may even deliberately disable their mobile device's connectivity as an operational security measure to avoid connecting to distrusted or potentially hostile networks.  While this may not directly support near real-time situational awareness, disconnected data collection is important for the ability to collect and analyze data to support near or long term customer-specific business decisions.

### Analysis and Decision Support
Of course, because MAGE collects and stores data structured for specific customer domains, a natural goal that follows is to make that data available for analysis to support customer business decisions.  While MAGE does not focus on providing analysis tools as core functionality, MAGE provides functionality to export data in standard formats that other analysis tools can consume, such as QGIS, ESRI, and Google Earth.  Additionally, MAGE's extensibility allows for the development of plugins and tools that support processing and analysis to derive further value for customers.

### Security

### Flexibility

## Customer Domain Applications
### Agriculture
### Disaster Response
### Law Enforcement/Tactical Operations
### Forestry
### Animal Study
### Maintenance Reporting
### Insurance

## Supporting Features

### Symbology

### Layers

### Feeds
Feeds are supplemental data sets that participants can add to their active event context. An event participant can select feeds to add from a list of feeds that an administrator has made available to the event.  Feed content could have any combination of spatial, temporal, or informational dimensions.  A participant can view the content of a feed in a list view and on the map as appropriate.  Feeds enhance situational awareness by adding information relevant to a customer's domain and/or particular event.

#### Background
Many MAGE customers have enterprise data sources available to them that are relevant to their particular mission domain and can aid users in the field.  For example, a disaster response team responding to an earthquake may desire to receive continuous updates about seismic activity in their operating area, including alerts and locations of detected tremors.  That data would originate from a service external to MAGE, but would be highly useful to incorporate directly in the responders' MAGE user experience.  The responder could then view the data without switching to another app, as well as see that data in the same context as their team's MAGE observations and team member locations.

### Tracking

## Core Terms

### Observation
An observation is a discrete data record a user creates to describe the state of a physical entity of interest, including a structured form data and attached media such as photos, videos, and audio.

#### Examples
An observation created as part of an animal study could include a data entry form with values for the species, the behavior, the habitat, and notes.  Such an observation would likely include photos, videos, and/or audio recording of the animal subject.

Observations created by a disaster response team could include  forms for physical property damage, humanitarian issues, and emergency medical circumstances.

### Form
A form is a collection of data entry fields that define the structure of the data values a user must capture for an observation.  See **Observation** above for examples.

### Form Field
A form field is a named data entry element that accepts a single value from a user.  A form field defines the domain-specific, semantic name of the captured value, as well as the type of data value the user must provide.  A form field may also define input rules for the captured data, such as a numeric field that does not allow values less than zero.

#### Examples
A text form field named `Incident summary` would require a user to input free text describing an incident.

A date form field named `Estimated completion` would require a user to input a date string, or more commonly, require a user a select a date from a calendar, estimating when a project will be finished.

A numeric form field named `Subject height (inches)` would require a user to input a number indicating the height in inches of an observed person or animal.

A select list form field named `Hair color` would require a user to select a single text value from a list of given options, such as `Black`, `Brown`, `Blonde`, `Gray`, `White`.

### Form Field Type
A form field type refers to the type of data a form field captures along with the method and constraints of capturing the data value.  Many form fields could have the same type, all with the same input method and validation constraints, but having different meanings depending on the customer's domain and the subject the form data describes.

#### Examples
An `email` form field type would accept a text string representing an email address.  The input method would be a simple text input box in which the user manually types an email address.  The `email` type would define validation constraints on the input, namely requiring the `name@domain` standard email format.  Given this form field type, a single form could define several `email` type form fields that have different meanings in a customer's domain.  For example, a customer could define a form that has `email` type form fields called `Point of contact email` and `Witness email`.

### Subject
A subject of an observation is a physical entity or occurrence of interest about which human users collect data to create an observation; the reason a human user submits an observation.

### Field
The field refers to the place where mobile device users can observe and collect data on objects and occurrences of interest.

### Field User
A field user is a human user collecting data in the field with a mobile device.

### Event
An event is a scope to manage users, the data they collect, and the data they can see.  A customer can assign its MAGE users to an event.  The observations those users create while participating in the event will only be available to other users participating in the event.  All observations exist within the scope of an event.  Similarly, the reported locations of users participating in an event are only visible to other users participating in the same event.  A customer also assigns forms to an event, so the types of observations the participants can create are based on the forms assigned to the event.

### Participant
A participant is a user that has access to the data associated with a specific event, as well as to submit observations for the event.

### Field Participant
A field participant is a participant of an event that is actively collecting observations for the event.

### Monitor
A monitor is a participant of an event that is not actively collecting data for the event in the field.

### Location
A location is the reported geospatial position of a field participant.  Locations, therefore, only exist within the scope of an event.

### Team

### Coordinator

### Event Manager

### Team Manager

### Map

### Map Layer

### Mobile Device

### Connectivity
The ability of a mobile device to send and receive data over the internet

## Feeds Terms

### Feature
### Feed Service
### Feed Service Type
### Feed Type
### Feed