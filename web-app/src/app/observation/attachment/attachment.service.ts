import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { FileUpload } from './attachment-upload/attachment-upload.component';

export enum AttachmentUploadStatus {
  COMPLETE,
  ERROR
}

export interface AttachmentUploadEvent {
  id: any
  status: AttachmentUploadStatus
  response?: any
}

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private uploadSource = new Subject<AttachmentUploadEvent>()

  upload$ = this.uploadSource.asObservable()

  constructor(private httpClient: HttpClient) { }

  upload(upload: FileUpload, url: string): Observable<HttpEvent<HttpResponse<Object>>> {
    const formData = new FormData();
    formData.append('attachment', upload.file);
    
    const observable = this.httpClient.post<HttpResponse<Object>>(url, formData, { observe: 'events' }).pipe(share())

    observable.subscribe((response: HttpEvent<HttpResponse<Object>>) => {
      if (response.type === HttpEventType.Response) {
        if (response.status === 200) {
          this.uploadSource.next({ id: upload.id, response: response.body, status: AttachmentUploadStatus.COMPLETE })
        } else {
          this.uploadSource.next({ id: upload.id, response: response.body, status: AttachmentUploadStatus.ERROR  })
        }
      }
    })

    return observable
  }
}
