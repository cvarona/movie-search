import { TestBed } from '@angular/core/testing';

import { OmbdService } from './ombd.service';

describe('OmbdService', () => {
  let service: OmbdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OmbdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
