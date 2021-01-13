import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { EventService } from 'src/app/upgrade/ajs-upgraded-providers';

interface AttachmentField {
  title: string,
  name: string,
  value: any[],
  min: number,
  max: number
}

@Component({
  selector: 'observation-edit-attachment',
  templateUrl: './observation-edit-attachment.component.html',
  styleUrls: ['./observation-edit-attachment.component.scss']
})
export class ObservationEditAttachmentComponent implements OnInit {
  @Input() field: AttachmentField
  @Input() url: string

  uploadId = 0
  uploadAttachments = false
  attachments = []

  constructor(
    private changeDetector: ChangeDetectorRef,
    @Inject(EventService) private eventService: any,
  ) { }

  ngOnInit() {
  }

  trackByAttachment(index: number, attachment: any): any {
    return attachment.id;
  }

  allAttachments(): any[] {
    const attachments = this.field.value || [];
    return attachments.concat(this.attachments)
  }

  onAttachmentFile(event): void {
    this.field.value = this.field.value || []
    const files = Array.from(event.target.files)
    files.forEach(file => {
      const id = this.uploadId++;
      this.field.value.push({
        id: id,
        file: file
      })
    })

    this.changeDetector.detectChanges()
  }

  removeAttachment($event): void {
    this.attachments = this.attachments.filter(attachment => attachment.id !== $event.id)
  }

}
