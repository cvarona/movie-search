import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { OmbdService } from '../ombd/ombd.service';
import { takeUntil, debounceTime, filter } from 'rxjs/operators';
import { SearchResult, SearchResponse, FullDetails } from '../ombd/ombd.interface';
import { Favorite } from '../favorites/favorite.interface';
import { FavoriteService } from '../favorites/favorite.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  loading = false;

  private searchResultEmitter = new BehaviorSubject<Array<SearchResult>>([]);
  private nameInput = new Subject<string>();

  private currentPage = 1;
  private noMoreSearchResults = false;
  private lastSearchTerm: string;

  private destroy$ = new Subject();

  constructor(
    private favoriteService: FavoriteService,
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
        this.currentPage = 1;
        this.noMoreSearchResults = false;
        this.lastSearchTerm = value;

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
    if (!this.noMoreSearchResults && index === ((this.currentPage - 1) * 10) + 4) {
      console.log(`búsqueda disparada con index ${index}`);
      this.currentPage++;
      this.search(this.lastSearchTerm);
    }
  }

  addFavorite(changeIcon = false) {
    this.favoriteService.increment(this.lastSearchTerm);
    if (changeIcon) {
      this.favoriteIcon = 'star';
    }
  }

  showDetail(result: SearchResult) {
    this.loading = true;
    this.searchService.searchById(result.imdbId)
      .subscribe(
        (fullDetails: FullDetails) => this.details = fullDetails,
        (error: Response) => console.log(error),
      )
      .add(() => this.loading = false);
  }

  private search(value: string): void {

    this.loading = true;
    this.searchService.searchByString(value, this.currentPage)
      .subscribe(
        (response: SearchResponse) => this.onSearchResponse(response),
        (error: Response | string) => {
          console.error(error);

          const display = (typeof error === 'string') ? error : (error as Response).statusText;
          this.matSnackBar.open(display, undefined, { verticalPosition: 'top', duration: 3000 });
        },
      )
      .add(() => this.loading = false);
  }

  private onSearchResponse(response: SearchResponse): void {
    if (response.page !== -1) {
      const accumulatedSearchResults = this.searchResultEmitter.value.concat(response.results);
      this.searchResultEmitter.next(accumulatedSearchResults);
    } else if (this.currentPage > 1) {
      // No more results for this term
      this.noMoreSearchResults = true;
    }
  }
}
