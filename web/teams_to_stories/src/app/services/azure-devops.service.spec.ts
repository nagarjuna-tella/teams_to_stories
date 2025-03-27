import { TestBed } from '@angular/core/testing';

import { AzureDevopsService } from './azure-devops.service';

describe('AzureDevopsService', () => {
  let service: AzureDevopsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AzureDevopsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
