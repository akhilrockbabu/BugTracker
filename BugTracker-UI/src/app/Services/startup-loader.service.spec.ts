import { TestBed } from '@angular/core/testing';

import { StartupLoaderService } from './startup-loader.service';

describe('StartupLoaderService', () => {
  let service: StartupLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StartupLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
