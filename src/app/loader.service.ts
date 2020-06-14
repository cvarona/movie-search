import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  loading$: Observable<boolean>;

  private emitter = new BehaviorSubject<boolean>(false);

  constructor() {
    this.loading$ = this.emitter.asObservable();
  }

  setActive() {
    this.emitter.next(true);
  }

  setInactive() {
    this.emitter.next(false);
  }
}
