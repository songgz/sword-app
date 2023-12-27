import { TestBed } from '@angular/core/testing';

import { MinAudioService } from './min-audio.service';

describe('MinAudioService', () => {
  let service: MinAudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MinAudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
