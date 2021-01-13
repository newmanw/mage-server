import { animate, style, transition, trigger } from '@angular/animations'
import { Component, DoCheck, ElementRef, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material'
import { EventService, FilterService, LocalStorageService, MapService, ObservationService, UserService } from 'src/app/upgrade/ajs-upgraded-providers'
import { AttachmentService, AttachmentUploadEvent, AttachmentUploadStatus } from '../attachment/attachment.service'
import { ObservationDeleteComponent } from '../observation-delete/observation-delete.component'

@Component({
  selector: 'observation-edit',
  templateUrl: './observation-edit.component.html',
  styleUrls: ['./observation-edit.component.scss'],
  animations: [
    trigger('error', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('250ms', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('250ms', style({ height: 0, opacity: 0 }))
      ])
    ]),
    trigger('mask', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms', style({ opacity: .2 })),
      ]),
      transition(':leave', [
        animate('250ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ObservationEditComponent implements OnInit, OnChanges, DoCheck {
  @Input() form: any
  @Input() observation: any
  @Input() preview: boolean

  @Output() close = new EventEmitter<any>()
  @Output() delete = new EventEmitter<any>()

  @ViewChild('editContent', { static: true }) editContent: ElementRef

  event: any

  mask = false
  saving = false
  error: any

  uploads = []
  attachmentUrl: string

  isNewObservation: boolean
  canDeleteObservation: boolean
  observationForm = {}

  initialObservation: any
  geometryStyle: any

  primaryField: any
  primaryFieldValue: string
  secondaryField: any
  secondaryFieldValue: string

  constructor(
    public dialog: MatDialog,
    private attachmentService: AttachmentService,
    @Inject(MapService) private mapService: any,
    @Inject(UserService) private userService: any,
    @Inject(FilterService) private filterService: any,
    @Inject(EventService) private eventService: any,
    @Inject(ObservationService) private observationService: any,
    @Inject(LocalStorageService) private localStorageService: any) {
  }

  ngOnInit(): void {
    this.canDeleteObservation = this.hasEventUpdatePermission() || this.isCurrentUsersObservation() || this.hasUpdatePermissionsInEventAcl()

    this.attachmentService.upload$.subscribe(event => this.onAttachmentUpload(event))
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.observation  && changes.observation.currentValue) {
      this.event = this.eventService.getEventById(this.observation.eventId)

      this.isNewObservation = this.observation.id === 'new'
      this.initialObservation = JSON.parse(JSON.stringify(this.observation))
      this.geometryStyle = { ...this.observation.style }

      if (this.isNewObservation) {
        this.mapService.addFeaturesToLayer([this.observation], 'Observations')
      }
    }

    if (changes.form && changes.form.currentValue) {
      const primaryForm = this.form.forms.length ? this.form.forms[0] : { fields: [] }
      this.primaryField = primaryForm.fields.find(field => {
        return field.name === primaryForm.primaryField
      }) || {}

      this.secondaryField = primaryForm.fields.find(field => {
        return field.name === primaryForm.variantField
      }) || {}
    }
  }

  ngDoCheck(): void {
    if (this.primaryField.value !== this.primaryFieldValue || this.secondaryField.value !== this.secondaryFieldValue) {
      this.primaryFieldValue = this.primaryField.value
      this.secondaryFieldValue = this.secondaryField.value

      const observation = { ...this.observation }
      this.formToObservation(this.form, observation)

      const style = this.observationService.getObservationStyleForForm(observation, this.event, this.form.forms[0])
      observation.style = style
      this.geometryStyle = style

      this.mapService.updateFeatureForLayer(observation, 'Observations')
    }
  }

  hasEventUpdatePermission(): boolean {
    return this.userService.myself.role.permissions.includes('DELETE_OBSERVAION')
  }

  isCurrentUsersObservation(): boolean {
    return this.observation.userId === this.userService.myself.id
  }

  hasUpdatePermissionsInEventAcl(): boolean {
    const myAccess = this.filterService.getEvent().acl[this.userService.myself.id]
    const aclPermissions = myAccess ? myAccess.permissions : []
    return aclPermissions.includes('update')
  }

  token(): string {
    return this.localStorageService.getToken()
  }

  formToObservation(form, observation): any {
    const geometry = form.geometryField.value;

    // put all coordinates in -180 to 180
    switch (geometry.type) {
      case 'Point':
        if (geometry.coordinates[0] < -180) geometry.coordinates[0] = geometry.coordinates[0] + 360
        else if (geometry.coordinates[0] > 180) geometry.coordinates[0] = geometry.coordinates[0] - 360
        break;
      case 'LineString':
        for (let i = 0; i < geometry.coordinates.length; i++) {
          const coord = geometry.coordinates[i];
          while (coord[0] < -180) coord[0] = coord[0] + 360
          while (coord[0] > 180) coord[0] = coord[0] - 360
        }
        break;
      case 'Polygon':
        for (let p = 0; p < geometry.coordinates.length; p++) {
          const poly = geometry.coordinates[p];
          for (let i = 0; i < poly.length; i++) {
            const coord = poly[i];
            while (coord[0] < -180) coord[0] = coord[0] + 360
            while (coord[0] > 180) coord[0] = coord[0] - 360
          }
        }
        break;
    }
    observation.geometry = geometry;

    observation.properties.timestamp = form.timestampField.value;

    observation.properties.forms = [];
    form.forms.forEach(observationForm => {
      const propertiesForm = {
        formId: observationForm.id
      };

      const fields = observationForm.fields.filter(field => {
        return !field.archived;
      });

      fields.forEach(field => {
        propertiesForm[field.name] = field.value;
      })

      observation.properties.forms.push(propertiesForm);
    })
  }

  save(): void {
    // TODO touch all fields so errors show
    // Maybe just trigger form submit

    if (!this.form.geometryField.value) {
      this.error = {
        message: 'Location is required'
      }
      return
    }

    this.saving = true
    const markedForDelete = this.observation.attachments ? this.observation.attachments.filter(attachment => attachment.markedForDelete) : []
    this.formToObservation(this.form, this.observation);
    // TODO look at this: this is a hack that will be corrected when we pull ids from the server
    const id = this.observation.id;
    if (id === 'new') {
      delete this.observation.id;
    }
    this.eventService.saveObservation(this.observation).then(observation => {
      // If this feature was added to the map as a new observation, remove it
      // as the event service will add it back to the map based on it new id
      // if it passes the current filter.
      if (id === 'new') {
        this.mapService.removeFeatureFromLayer({ id: id }, 'Observations')
      }

      this.error = null;

      // delete any attachments that were marked for delete
      markedForDelete.forEach(attachment => {
        this.eventService.deleteAttachmentForObservation(this.observation, attachment);
        observation.attachments = observation.attachments.filter(a => a.id !== attachment.id)
      });

      // TODO need better way to check for attachments to upload
      // TODO are these stored in the observation forms?
      this.form.forms.forEach(form => {
        form.fields.forEach(field => {
          if (field.type === 'attachment' && Array.isArray(field.value)) {
            field.value.forEach(attachment => {
              if (attachment.file) {
                this.uploads.push(attachment.id)
              }
            })
          }
        })
      })

      if (this.uploads.length) {
        this.attachmentUrl = `${observation.url}/attachments`
      } else {
        this.form = null
        this.uploads = []
        this.saving = false
        this.close.emit(observation)
      }
    }, err => {
      if (id === 'new') {
        this.observation.id = 'new'
      }

      this.saving = false;
      this.error = {
        message: err.data
      }
    })
  }

  cancel(): void {
    this.observation.geometry = this.initialObservation.geometry;
    if (this.observation.id !== 'new') {
      this.mapService.updateFeatureForLayer(this.observation, 'Observations')
    } else {
      this.mapService.removeFeatureFromLayer(this.observation, 'Observations')
    }

    const attachments = this.observation.attachments || []
    attachments.forEach(attachment => {
      delete attachment.markedForDelete;
    })

    this.close.emit()
  }

  deleteObservation(): void {
    this.dialog.open(ObservationDeleteComponent, {
      width: '500px',
      data: this.observation,
      autoFocus: false
    }).afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.delete.emit({
          observation: this.observation
        })
      }
    })
  }

  onGeometryEdit(event): void {
    this.mask = event.action === 'edit';

    if (this.mask) {
      const elementBounds = event.source.nativeElement.getBoundingClientRect();
      const parentBounds = this.editContent.nativeElement.getBoundingClientRect();
      if (elementBounds.top < parentBounds.top || elementBounds.bottom > parentBounds.bottom) {
        event.source.nativeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }

  onGeometryChanged(event): void {
    this.form.geometryField.value = event.feature ? event.feature.geometry : null;
  }

  private onAttachmentUpload(event: AttachmentUploadEvent): void {
    switch(event.status) {
      case AttachmentUploadStatus.COMPLETE: {
        // TODO this is adding the attachment to attachments array, no longer exists
        // figure out how to update, or if I need to update the observations attachments
        //this.eventService.addAttachmentToObservation(this.observation, event.response);

        this.uploads = this.uploads.filter(id => id !== event.id)
        if (this.uploads.length === 0) {
          this.saving = false;
          this.close.emit();
        }
      }
      case AttachmentUploadStatus.ERROR: {
        // TODO inform user in some way that attachment didn't upload
        this.uploads = this.uploads.filter(id => id !== event.id)
        if (this.uploads.length === 0) {
          this.saving = false;
          this.close.emit();
        }
      }
    }
  }
}
