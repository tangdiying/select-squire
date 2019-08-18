import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectSquireComponent } from './select-squire.component';

describe('SelectSquireComponent', () => {
  let component: SelectSquireComponent;
  let fixture: ComponentFixture<SelectSquireComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectSquireComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectSquireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
