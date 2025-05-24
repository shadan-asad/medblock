import { TestBed } from '@angular/core/testing';
import { DatabaseService } from './database.service';
import { PGlite } from '@electric-sql/pglite';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let mockPGlite: jasmine.SpyObj<PGlite>;

  beforeEach(() => {
    // Create a mock PGlite instance
    mockPGlite = jasmine.createSpyObj('PGlite', ['query']);
    
    TestBed.configureTestingModule({
      providers: [
        DatabaseService,
        { provide: PGlite, useValue: mockPGlite }
      ]
    });
    service = TestBed.inject(DatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize database with required tables', async () => {
    // Mock successful query execution
    mockPGlite.query.and.returnValue(Promise.resolve({ rows: [], fields: [] }));

    // Trigger initialization
    await service['initializeDatabase']();

    // Verify that the required tables were created
    expect(mockPGlite.query).toHaveBeenCalledWith(jasmine.stringContaining('CREATE TABLE IF NOT EXISTS patients'));
    expect(mockPGlite.query).toHaveBeenCalledWith(jasmine.stringContaining('CREATE TABLE IF NOT EXISTS audit_log'));
  });

  it('should handle database initialization errors', async () => {
    // Mock query failure
    const error = new Error('Database initialization failed');
    mockPGlite.query.and.returnValue(Promise.reject(error));

    // Verify that the error is thrown
    await expectAsync(service['initializeDatabase']()).toBeRejectedWith(error);
  });

  it('should execute queries successfully', async () => {
    const testQuery = 'SELECT * FROM patients';
    const expectedResult = { rows: [{ id: 1, name: 'Test Patient' }], fields: [] };
    mockPGlite.query.and.returnValue(Promise.resolve(expectedResult));

    const result = await service.executeQuery(testQuery);

    expect(mockPGlite.query).toHaveBeenCalledWith(testQuery, []);
    expect(result).toEqual(expectedResult);
  });

  it('should handle query execution errors', async () => {
    const testQuery = 'SELECT * FROM patients';
    const error = new Error('Query execution failed');
    mockPGlite.query.and.returnValue(Promise.reject(error));

    await expectAsync(service.executeQuery(testQuery)).toBeRejectedWith(error);
  });

  it('should provide initialization status', (done) => {
    service.isInitialized().subscribe(status => {
      expect(typeof status).toBe('boolean');
      done();
    });
  });
}); 