import { Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, debounceTime, filter } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatSnackBar } from '@angular/material/snack-bar';

import { OmbdService } from '../ombd/ombd.service';
import { MINIMUM_SEARCH_TERM_LENGTH, SearchResult, SearchResponse, FullDetails } from '../ombd/ombd.interface';
import { Favorite } from '../favorites/favorite.interface';
import { FavoriteService } from '../favorites/favorite.service';
import { LoaderService } from '../loader.service';

const DEBOUNCE_TIME = 500;
const ERROR_SNACK_DURATION = 3000;
const GENERIC_ERROR_MSG = 'Oops! Something went wrong';

type FavoriteIcon = 'star' | 'star_outline';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainViewComponent implements OnInit, OnDestroy {

  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;

  results$: Observable<Array<SearchResult>>;
  favorites$: Observable<Array<Favorite>>;
  favoriteIcon$: Observable<FavoriteIcon>;
  details$: Observable<FullDetails>;

  private nameInput = new Subject<string>();

  private searchResponse: SearchResponse;
  private searchResultEmitter = new BehaviorSubject<Array<SearchResult>>([]);

  private searchResultDetailsEmitter = new BehaviorSubject<FullDetails>(null);
  private favoriteIconEmitter = new BehaviorSubject<FavoriteIcon>('star_outline');

  private destroy$ = new Subject();

  constructor(
    private favoriteService: FavoriteService,
    private loaderService: LoaderService,
    private searchService: OmbdService,
    private matSnackBar: MatSnackBar,
  ) {

    this.favorites$ = this.favoriteService.topThree$;
    this.favoriteIcon$ = this.favoriteIconEmitter.asObservable();
    this.details$ = this.searchResultDetailsEmitter.asObservable();
  }

  ngOnInit(): void {
    this.nameInput.asObservable()
      .pipe(
        takeUntil(this.destroy$),
        filter((name: string) => name?.length >= MINIMUM_SEARCH_TERM_LENGTH),
        debounceTime(DEBOUNCE_TIME),
      )
      .subscribe((value: string) => {
        this.searchResponse = null;

        const isFavorite = this.favoriteService.isFavorite(value);
        this.favoriteIconEmitter.next(isFavorite ? 'star' : 'star_outline');
        if (isFavorite) {
          this.favoriteService.increment(value);
        }

        this.searchResultDetailsEmitter.next(null);
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

  onScrollIndexChange() {

    const renderedRange = this.viewport.getRenderedRange().end;
    const totalDataLength = this.viewport.getDataLength();

    if (this.searchResponse?.hasNext && renderedRange === totalDataLength) {
      this.search();
    }
  }

  addFavorite() {
    if (!!this.searchResponse) {
      this.favoriteService.increment(this.searchResponse.searchTerm);
      this.favoriteIconEmitter.next('star');
    }
  }

  incrementFavorite(term: string) {
    this.favoriteService.increment(term);
  }

  isSelected(result: SearchResult) {
    return this.searchResultDetailsEmitter.value?.imdbId === result?.imdbId;
  }

  showDetail(result: SearchResult) {
    this.loaderService.setActive();
    this.searchService.searchById(result.imdbId)
      .subscribe(
        (fullDetails: FullDetails) => this.searchResultDetailsEmitter.next(fullDetails),
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
    const display = (typeof error === 'string') ? error : (error as Response).statusText || GENERIC_ERROR_MSG;
    this.matSnackBar.open(display, undefined, { verticalPosition: 'top', duration: ERROR_SNACK_DURATION });
  }

  private onSearchResponse(response: SearchResponse): void {

    this.searchResponse = response;

    const accumulatedSearchResults = this.searchResultEmitter.value.concat(response.results);
    this.searchResultEmitter.next(accumulatedSearchResults);
  }
}
