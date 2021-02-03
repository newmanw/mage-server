import { TestBed } from '@angular/core/testing';

import { StaticIconService } from './static-icon.service';

describe('IconServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StaticIconService = TestBed.get(StaticIconService);
    expect(service).toBeTruthy();
  });
});
