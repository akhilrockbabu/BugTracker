import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BugForm } from './bug-form';

describe('BugForm', () => {
  let component: BugForm;
  let fixture: ComponentFixture<BugForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BugForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BugForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
