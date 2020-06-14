import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { OmbdService } from '../ombd/ombd.service';
import { takeUntil, debounceTime, filter } from 'rxjs/operators';
import { SearchResult, SearchResponse, FullDetails } from '../ombd/ombd.interface';
import { Favorite } from '../favorites/favorite.interface';
import { FavoriteService } from '../favorites/favorite.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderService } from '../loader.service';

const DEBOUNCE_TIME = 500;

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class MainViewComponent implements OnInit, OnDestroy {

  results$: Observable<Array<SearchResult>>;
  favorites$: Observable<Array<Favorite>>;
  favoriteIcon: 'star' | 'star_outline' = 'star_outline';
  details: FullDetails;

  private nameInput = new Subject<string>();

  private searchResponse: SearchResponse;
  private searchResultEmitter = new BehaviorSubject<Array<SearchResult>>([]);

  private destroy$ = new Subject();

  constructor(
    private favoriteService: FavoriteService,
    private loaderService: LoaderService,
    private searchService: OmbdService,
    private matSnackBar: MatSnackBar,
  ) {

    this.favorites$ = this.favoriteService.topThree$;
  }

  ngOnInit(): void {
    this.nameInput.asObservable()
      .pipe(
        takeUntil(this.destroy$),
        filter((name: string) => name?.length >= 3),
        debounceTime(DEBOUNCE_TIME),
      )
      .subscribe((value: string) => {
        this.searchResponse = null;

        const isFavorite = this.favoriteService.isFavorite(value);
        this.favoriteIcon = isFavorite ? 'star' : 'star_outline';
        if (isFavorite) {
          this.favoriteService.increment(value);
        }

        this.details = null;
        this.searchResultEmitter.next([]);
        this.search(value);
      });

    this.results$ = this.searchResultEmitter.asObservable();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  onInput(input: string) {
    this.nameInput.next(input);
  }

  onScrollIndexChange(index: number) {
    if (this.searchResponse?.hasNext && index === ((this.searchResponse.page - 1) * 10) + 4) {
      this.search();
    }
  }

  addFavorite() {
    if (!!this.searchResponse) {
      this.favoriteService.increment(this.searchResponse.searchTerm);
      this.favoriteIcon = 'star';
    }
  }

  incrementFavorite(term: string) {
    this.favoriteService.increment(term);
  }

  showDetail(result: SearchResult) {
    this.loaderService.setActive();
    this.searchService.searchById(result.imdbId)
      .subscribe(
        (fullDetails: FullDetails) => this.details = fullDetails,
        (error: Response | string) => this.showError(error),
      )
      .add(() => this.loaderService.setInactive());
  }

  private search(value?: string): void {

    this.loaderService.setActive();

    const request$ = !!this.searchResponse ? this.searchResponse.next() : this.searchService.searchByString(value);
    request$
      .subscribe(
        (response: SearchResponse) => this.onSearchResponse(response),
        (error: Response | string) => this.showError(error),
      )
      .add(() => this.loaderService.setInactive());
  }

  private showError(error: string | Response) {
    console.error(error);
    const display = (typeof error === 'string') ? error : (error as Response).statusText;
    this.matSnackBar.open(display, undefined, { verticalPosition: 'top', duration: 3000 });
  }

  private onSearchResponse(response: SearchResponse): void {

    this.searchResponse = response;

    const accumulatedSearchResults = this.searchResultEmitter.value.concat(response.results);
    this.searchResultEmitter.next(accumulatedSearchResults);
  }
}
