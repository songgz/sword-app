import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizListenPage } from './quiz-listen.page';

describe('QuizListenPage', () => {
  let component: QuizListenPage;
  let fixture: ComponentFixture<QuizListenPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(QuizListenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
