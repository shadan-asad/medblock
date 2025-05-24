import { TestBed } from '@angular/core/testing';
import { SyncService } from './sync.service';

describe('SyncService', () => {
  let service: SyncService;
  let mockBroadcastChannel: jasmine.SpyObj<BroadcastChannel>;

  beforeEach(() => {
    // Create a mock BroadcastChannel
    mockBroadcastChannel = jasmine.createSpyObj('BroadcastChannel', ['postMessage', 'close']);
    
    // Mock the BroadcastChannel constructor
    spyOn(window, 'BroadcastChannel').and.returnValue(mockBroadcastChannel);

    TestBed.configureTestingModule({
      providers: [SyncService]
    });
    service = TestBed.inject(SyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a BroadcastChannel with correct name', () => {
    expect(window.BroadcastChannel).toHaveBeenCalledWith('medblock-sync');
  });

  it('should broadcast messages', () => {
    const testMessage = {
      type: 'INSERT' as const,
      table: 'patients',
      data: { id: 1, name: 'Test Patient' },
      timestamp: Date.now()
    };

    service.broadcast(testMessage);

    expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith(testMessage);
  });

  it('should receive messages through the observable', (done) => {
    const testMessage = {
      type: 'UPDATE' as const,
      table: 'patients',
      data: { id: 1, name: 'Updated Patient' },
      timestamp: Date.now()
    };

    // Subscribe to messages
    service.getSyncMessages().subscribe(message => {
      expect(message).toEqual(testMessage);
      done();
    });

    // Simulate receiving a message
    const messageEvent = new MessageEvent('message', { data: testMessage });
    mockBroadcastChannel.onmessage?.call(mockBroadcastChannel, messageEvent);
  });

  it('should close the channel on destroy', () => {
    service.ngOnDestroy();
    expect(mockBroadcastChannel.close).toHaveBeenCalled();
  });

  it('should handle different message types', () => {
    const messageTypes = ['INSERT', 'UPDATE', 'DELETE', 'QUERY'] as const;
    
    messageTypes.forEach(type => {
      const testMessage = {
        type,
        table: 'patients',
        data: { id: 1 },
        timestamp: Date.now()
      };

      service.broadcast(testMessage);
      expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith(testMessage);
    });
  });
}); 