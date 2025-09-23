import { TestBed } from '@angular/core/testing';

import { TeamService } from './team';

describe('Team', () => {
  let service: TeamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
