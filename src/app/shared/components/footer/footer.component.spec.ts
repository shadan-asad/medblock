import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { By } from '@angular/platform-browser';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a footer element', () => {
    const footer = fixture.debugElement.query(By.css('footer'));
    expect(footer).toBeTruthy();
    expect(footer.classes['footer']).toBeTruthy();
  });

  it('should have correct copyright text', () => {
    const copyrightText = fixture.debugElement.query(By.css('.text-muted'));
    expect(copyrightText.nativeElement.textContent).toContain('© 2024 MedBlock');
  });

  it('should have correct Bootstrap classes', () => {
    const footer = fixture.debugElement.query(By.css('footer'));
    expect(footer.classes['mt-auto']).toBeTruthy();
    expect(footer.classes['py-3']).toBeTruthy();
    expect(footer.classes['bg-light']).toBeTruthy();
  });

  it('should have a centered container', () => {
    const container = fixture.debugElement.query(By.css('.container'));
    expect(container.classes['text-center']).toBeTruthy();
  });
});
