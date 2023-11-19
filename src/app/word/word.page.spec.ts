import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WordPage } from './word.page';

describe('WordPage', () => {
  let component: WordPage;
  let fixture: ComponentFixture<WordPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(WordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
