import { TestBed } from '@angular/core/testing';

import { Token1InterceptorInterceptor } from './token1-interceptor.interceptor';

describe('Token1InterceptorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      Token1InterceptorInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: Token1InterceptorInterceptor = TestBed.inject(Token1InterceptorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
