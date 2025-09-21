import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTeamsComponent } from './project-teams';

describe('ProjectTeams', () => {
  let component: ProjectTeamsComponent;
  let fixture: ComponentFixture<ProjectTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectTeamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
