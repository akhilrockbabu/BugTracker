import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BugListComponent } from './bug-list-component';

describe('BugListComponent', () => {
  let component: BugListComponent;
  let fixture: ComponentFixture<BugListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BugListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BugListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
