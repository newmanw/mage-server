import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDividerModule, MatListModule, MatToolbarModule } from '@angular/material';
import { FeedItemSummaryModule } from './feed-item/feed-item-summary/feed-item-summary.module';
import { FeedComponent } from './feed.component';


describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatToolbarModule,
        FeedItemSummaryModule,
        MatDividerModule,
        MatListModule,
        HttpClientModule
      ],
      declarations: [
        FeedComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
