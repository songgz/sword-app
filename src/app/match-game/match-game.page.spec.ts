import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchGamePage } from './match-game.page';

describe('MatchGamePage', () => {
  let component: MatchGamePage;
  let fixture: ComponentFixture<MatchGamePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MatchGamePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
