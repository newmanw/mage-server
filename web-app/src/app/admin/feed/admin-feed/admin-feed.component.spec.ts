import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatCardModule, MatDialogModule, MatDialogRef, MatFormFieldModule, MatIconModule, MatListModule, MatPaginatorModule, MatSelectModule, MatSnackBarModule, MAT_DIALOG_DATA } from '@angular/material';
import { StateService } from '@uirouter/angular';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Event, UserService } from 'src/app/upgrade/ajs-upgraded-providers';
import { AdminFeedComponent } from './admin-feed.component';

class MockUserService {
  get myself(): any {
    return {
      role: {
        permissions: []
      }
    };
  }
}

class MockStateService {
  get params(): any {
    return {};
  }
}

class MockEventResource {
  query(): Array<any> {
    return [];
  }
}

describe('AdminFeedComponent', () => {
  let component: AdminFeedComponent;
  let fixture: ComponentFixture<AdminFeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [{
        provide: StateService,
        useClass: MockStateService
      }, {
        provide: MatDialogRef, useValue: {}
      }, {
        provide: MAT_DIALOG_DATA, useValue: {}
      }, {
        provide: UserService,
        useClass: MockUserService
      }, {
        provide: Event,
        useClass: MockEventResource
      }],
      imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatCardModule,
        MatAutocompleteModule,
        MatListModule,
        MatPaginatorModule,
        MatSnackBarModule,
        FormsModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        ReactiveFormsModule,
        HttpClientModule
      ],
      declarations: [ AdminFeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    
    expect(component).toBeTruthy();
  });
});
