import { TestBed } from '@angular/core/testing';

import { FeedItemPopupService } from './popup.service';

describe('ItemPopupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FeedItemPopupService = TestBed.get(FeedItemPopupService);
    expect(service).toBeTruthy();
  });
});
