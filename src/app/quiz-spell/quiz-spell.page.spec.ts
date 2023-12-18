import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizSpellPage } from './quiz-spell.page';

describe('QuizSpellPage', () => {
  let component: QuizSpellPage;
  let fixture: ComponentFixture<QuizSpellPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(QuizSpellPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
