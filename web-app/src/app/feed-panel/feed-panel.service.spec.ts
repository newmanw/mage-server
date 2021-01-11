import { TestBed } from '@angular/core/testing';

import { FeedPanelService } from './feed-panel.service';

describe('FeedUIService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FeedPanelService = TestBed.get(FeedPanelService);
    expect(service).toBeTruthy();
  });
});
