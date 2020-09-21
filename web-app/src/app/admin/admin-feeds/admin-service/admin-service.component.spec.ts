import { JsonSchemaFormModule } from '@ajsf/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule, MatDialogModule, MatDialogRef, MatIconModule, MatListModule, MatPaginatorModule, MAT_DIALOG_DATA } from '@angular/material';
import { StateService } from '@uirouter/angular';
import { JsonSchemaComponent } from 'src/app/json-schema/json-schema.component';
import { UserService } from 'src/app/upgrade/ajs-upgraded-providers';
import { AdminBreadcrumbModule } from '../../admin-breadcrumb/admin-breadcrumb.module';
import { AdminServiceComponent } from './admin-service.component';

class MockStateService {
  get params(): any {
    return {};
  }
}

class MockUserService {
  get myself(): any {
    return {
      role: {
        permissions: []
      }
    };
  }
}

describe('AdminServiceComponent', () => {
  let component: AdminServiceComponent;
  let fixture: ComponentFixture<AdminServiceComponent>;

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
      }],
      imports: [
        MatDialogModule,
        MatIconModule,
        MatCardModule,
        MatListModule,
        MatPaginatorModule,
        HttpClientTestingModule,
        JsonSchemaFormModule,
        AdminBreadcrumbModule
      ],
      declarations: [
        JsonSchemaComponent,
        AdminServiceComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
