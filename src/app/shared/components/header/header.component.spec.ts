import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a navbar with brand name', () => {
    const navbar = fixture.debugElement.query(By.css('.navbar'));
    const brand = fixture.debugElement.query(By.css('.navbar-brand'));
    
    expect(navbar).toBeTruthy();
    expect(brand.nativeElement.textContent).toContain('MedBlock');
  });

  it('should have navigation links', () => {
    const navLinks = fixture.debugElement.queryAll(By.css('.nav-link'));
    
    expect(navLinks.length).toBe(2);
    expect(navLinks[0].nativeElement.textContent).toContain('Patients');
    expect(navLinks[1].nativeElement.textContent).toContain('SQL Query');
  });

  it('should have correct router links', () => {
    const patientsLink = fixture.debugElement.query(By.css('a[routerLink="/patients"]'));
    const sqlQueryLink = fixture.debugElement.query(By.css('a[routerLink="/sql-query"]'));
    
    expect(patientsLink).toBeTruthy();
    expect(sqlQueryLink).toBeTruthy();
  });

  it('should have a responsive toggle button', () => {
    const toggleButton = fixture.debugElement.query(By.css('.navbar-toggler'));
    
    expect(toggleButton).toBeTruthy();
    expect(toggleButton.attributes['data-bs-toggle']).toBe('collapse');
    expect(toggleButton.attributes['data-bs-target']).toBe('#navbarNav');
  });

  it('should have a collapsible navigation menu', () => {
    const navCollapse = fixture.debugElement.query(By.css('#navbarNav'));
    
    expect(navCollapse).toBeTruthy();
    expect(navCollapse.classes['collapse']).toBeTruthy();
    expect(navCollapse.classes['navbar-collapse']).toBeTruthy();
  });
});
