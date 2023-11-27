import { TestBed } from '@angular/core/testing';

import { WordTrackerService } from './word-tracker.service';

describe('WordTrackerService', () => {
  let service: WordTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WordTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
