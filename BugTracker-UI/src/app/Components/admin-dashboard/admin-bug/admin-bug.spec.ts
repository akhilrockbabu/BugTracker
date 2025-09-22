import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBug } from './admin-bug';

describe('AdminBug', () => {
  let component: AdminBug;
  let fixture: ComponentFixture<AdminBug>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBug]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBug);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
