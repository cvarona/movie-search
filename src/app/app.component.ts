import { Component, OnDestroy } from '@angular/core';
import { LoaderService } from './services/loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorService } from './services/error.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const ERROR_SNACK_DURATION = 3000;
const GENERIC_ERROR_MSG = 'Oops! Something went wrong';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

  private onDestroy = new Subject<boolean>();

  constructor(
    public loaderService: LoaderService,
    private errorService: ErrorService,
    private matSnackBar: MatSnackBar) {

    this.errorService.error$
      .pipe(takeUntil(this.onDestroy.asObservable()))
      .subscribe((error: string | Response) => this.showError(error));
  }

  ngOnDestroy() {
    this.onDestroy.next(true);
    this.onDestroy.unsubscribe();
  }

  private showError(error: string | Response) {
    const display = (typeof error === 'string') ? error : (error as Response).statusText || GENERIC_ERROR_MSG;
    this.matSnackBar.open(display, undefined, { verticalPosition: 'top', duration: ERROR_SNACK_DURATION });
  }
}
