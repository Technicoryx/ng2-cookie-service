import { TestBed } from '@angular/core/testing';

import { Ng2CookieService } from './ng2-cookie.service';

describe('Ng2CookieService', () => {
  let service: Ng2CookieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ng2CookieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
