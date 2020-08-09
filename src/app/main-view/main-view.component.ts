import { Component, OnInit, OnDestroy, ViewEncapsulation, HostListener, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, debounceTime, filter, take } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { Store, select } from '@ngrx/store';

import { MINIMUM_SEARCH_TERM_LENGTH, SearchResult, FullDetails } from '../services/ombd/ombd.interface';
import { Favorite } from '../favorites/favorite.interface';
import { FavoriteService } from '../favorites/favorite.service';
import { AppState } from '../state/app.state';
import { search, loadMore, selectResult } from './state/main.actions';
import { resultDetailsSelector, searchResultsSelector, searchTermSelector } from './state/main.selectors';

const DEBOUNCE_TIME = 500;

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

  // Used to change the favorite icon next to the search term input field
  private favoriteIconEmitter = new BehaviorSubject<FavoriteIcon>('star_outline');

  // Used to do some cleanup when leaving the page
  private destroy$ = new Subject();

  constructor(
    private store: Store<AppState>,
    private favoriteService: FavoriteService,
  ) {

    // Observable initialization
    this.favorites$ = this.favoriteService.topThree$;
    this.favoriteIcon$ = this.favoriteIconEmitter.asObservable();

    this.results$ = this.store.pipe(select(searchResultsSelector));
    this.details$ = this.store.pipe(select(resultDetailsSelector));
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

        // ...assess whether it's a favorite search term in order to visually
        // display it as such by means of an icon...
        const isFavorite = this.favoriteService.isFavorite(value);
        this.favoriteIconEmitter.next(isFavorite ? 'star' : 'star_outline');
        if (isFavorite) {
          // Don't forget to increment the times this favorite search term
          // has been used!
          this.favoriteService.increment(value);
        }

        // ...and finaly do the search
        this.store.dispatch(search({ searchTerm: value }));
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
    if (!!renderedRange && renderedRange === totalDataLength) {
      this.store.dispatch(loadMore());
    }
  }

  addFavorite() {
    this.store.select(searchTermSelector).pipe(take(1)).subscribe(
      (term: string) => {
        this.incrementFavorite(term);
        this.favoriteIconEmitter.next('star');
      }
    );
  }

  incrementFavorite(term: string) {
    this.favoriteService.increment(term);
  }

  // Requests a search result's details
  showDetail(result: SearchResult) {
    this.store.dispatch(selectResult({ selectedResult: result }));
  }

  @HostListener('window:beforeunload', ['$event'])
  doCleanup($event) {
    // ngOnDestroy won't get invoked if the user closes the window or tab, or types
    // another location in the url bar
    this.ngOnDestroy();
  }
}
