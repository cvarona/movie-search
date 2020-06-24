import { Component, OnInit, OnDestroy, ViewEncapsulation, HostListener } from '@angular/core';
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

  // We need a reference to the result list viewport in order to handle scrolling
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;

  // Result list (obtained by typing in the search field)
  results$: Observable<Array<SearchResult>>;

  // Result detail (obtained by clicking on a search result)
  details$: Observable<FullDetails>;

  // Three most favorite search terms, obtained from the favorite service
  favorites$: Observable<Array<Favorite>>;

  // Favorite icon rendered next to the search term input field
  favoriteIcon$: Observable<FavoriteIcon>;

  // Used to collect and debounce the search term typed by the user
  private searchTermInput = new Subject<string>();

  // Last search response obtained
  private searchResponse: SearchResponse;

  // Used to populate the result search list by accumulation
  private searchResultEmitter = new BehaviorSubject<Array<SearchResult>>([]);

  // Used to handle search result selection
  private searchResultDetailsEmitter = new BehaviorSubject<FullDetails>(null);

  // Used to change the favorite icon next to the search term input field
  private favoriteIconEmitter = new BehaviorSubject<FavoriteIcon>('star_outline');

  // Used to do some cleanup when leaving the page
  private destroy$ = new Subject();

  constructor(
    private favoriteService: FavoriteService,
    private loaderService: LoaderService,
    private searchService: OmbdService,
    private matSnackBar: MatSnackBar,
  ) {

    // Observable initialization
    this.favorites$ = this.favoriteService.topThree$;
    this.favoriteIcon$ = this.favoriteIconEmitter.asObservable();
    this.details$ = this.searchResultDetailsEmitter.asObservable();
    this.results$ = this.searchResultEmitter.asObservable();
  }

  ngOnInit(): void {
    // We are required to search as the user types in the search term
    // input field; in order to do that we create a debounced observable
    // from the search term subject, which we'll be feeding with raw user input
    this.searchTermInput.asObservable()
      .pipe(
        takeUntil(this.destroy$),
        filter((name: string) => name?.trim()?.length >= MINIMUM_SEARCH_TERM_LENGTH),
        debounceTime(DEBOUNCE_TIME),
      )
      .subscribe((value: string) => {

        // Once we have a valid search term we reset the search response...
        this.searchResponse = null;

        // ...assess whether it's a favorite search term in order to visually
        // display it as such by means of an icon...
        const isFavorite = this.favoriteService.isFavorite(value);
        this.favoriteIconEmitter.next(isFavorite ? 'star' : 'star_outline');
        if (isFavorite) {
          // Don't forget to increment the times this favorite search term
          // has been used!
          this.favoriteService.increment(value);
        }

        // ...clean the selected result details and the search result list...
        this.searchResultDetailsEmitter.next(null);
        this.searchResultEmitter.next([]);

        // ...and finaly do the search
        this.search(value);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.favoriteService.store();
  }

  onInput(input: string) {
    this.searchTermInput.next(input);
  }

  onScrollIndexChange() {

    const renderedRange = this.viewport.getRenderedRange().end;
    const totalDataLength = this.viewport.getDataLength();

    // If the user scrolls to the end of the available search results and
    // the last search response says there are more pages to be retrieved,
    // we go for it
    if (this.searchResponse?.hasNext && renderedRange === totalDataLength) {
      this.search();
    }
  }

  addFavorite() {
    if (!!this.searchResponse) {
      this.incrementFavorite(this.searchResponse.searchTerm);
      this.favoriteIconEmitter.next('star');
    }
  }

  incrementFavorite(term: string) {
    this.favoriteService.increment(term);
  }

  isSelected(result: SearchResult) {
    return this.searchResultDetailsEmitter.value?.imdbId === result?.imdbId;
  }

  // Requests a search result's details
  showDetail(result: SearchResult) {
    this.loaderService.setActive();
    this.searchService.searchById(result.imdbId)
      .subscribe(
        (fullDetails: FullDetails) => this.searchResultDetailsEmitter.next(fullDetails),
        (error: Response | string) => this.showError(error),
      )
      .add(() => this.loaderService.setInactive());
  }

  @HostListener('window:beforeunload', ['$event'])
  doCleanup($event) {
    // ngOnDestroy won't get invoked if the user closes the window or tab, or types
    // another location in the url bar
    this.ngOnDestroy();
  }

  private search(value?: string): void {

    this.loaderService.setActive();

    // If we already have a previous search response, we'll request the next page (when
    // this happens we'll receive no term input parameter); otherwise a new search is
    // done.
    const request$ = !!this.searchResponse ? this.searchResponse.next() : this.searchService.searchByString(term);
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

    // We keep the received response, then emit the results for the search result list to load them
    this.searchResponse = response;

    const accumulatedSearchResults = this.searchResultEmitter.value.concat(response.results);
    this.searchResultEmitter.next(accumulatedSearchResults);
  }
}
