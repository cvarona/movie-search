import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

/**
 * Rudimentary service for handling the displaying of progress spinner
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  error$: Observable<string | Response>;

  private emitter = new Subject<string | Response>();

  constructor() {
    this.error$ = this.emitter.asObservable();
  }

  onError(error: string | Response) {
    this.emitter.next(error);
  }
}
