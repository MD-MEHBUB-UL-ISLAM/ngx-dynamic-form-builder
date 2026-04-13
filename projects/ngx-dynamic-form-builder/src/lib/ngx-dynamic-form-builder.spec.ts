import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxDynamicFormBuilder } from './ngx-dynamic-form-builder';

describe('NgxDynamicFormBuilder', () => {
  let component: NgxDynamicFormBuilder;
  let fixture: ComponentFixture<NgxDynamicFormBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxDynamicFormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxDynamicFormBuilder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
