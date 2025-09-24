import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Allbugs } from './allbugs';

describe('Allbugs', () => {
  let component: Allbugs;
  let fixture: ComponentFixture<Allbugs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Allbugs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Allbugs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
