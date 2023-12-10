import { TestBed } from '@angular/core/testing';

import { AppCtxService } from './app-ctx.service';

describe('AppCtxService', () => {
  let service: AppCtxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppCtxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
