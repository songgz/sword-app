import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VocabularyPage } from './vocabulary.page';

describe('VocabularyPage', () => {
  let component: VocabularyPage;
  let fixture: ComponentFixture<VocabularyPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(VocabularyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
