import { TestBed } from '@angular/core/testing';

import { CtxStorageService } from './ctx-storage.service';

describe('CtxStorageService', () => {
  let service: CtxStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CtxStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
