import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBug } from './update-bug';

describe('UpdateBug', () => {
  let component: UpdateBug;
  let fixture: ComponentFixture<UpdateBug>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBug]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBug);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
