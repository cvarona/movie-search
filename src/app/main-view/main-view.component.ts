import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { OmbdService } from '../shared/ombd/ombd.service';
import { FormControl } from '@angular/forms';
import { takeUntil, debounce, debounceTime, filter } from 'rxjs/operators';
import { SearchResult, SearchResponse, FullDetails } from '../shared/ombd/ombd.interface';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

const DEBOUNCE_TIME = 500;

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class MainViewComponent implements OnInit, OnDestroy, AfterViewInit {

  results$: Observable<Array<SearchResult>>;
  selectedResult: FullDetails;
  loading = false;

  private searchResultEmitter = new BehaviorSubject<Array<SearchResult>>([]);
  private nameInput = new Subject<string>();
  private destroy$ = new Subject();

  private currentPage = 1;
  private noMoreSearchResults = false;
  private lastSearchTerm: string;
  constructor(private searchService: OmbdService) {
  }

  ngOnInit(): void {
    this.nameInput.asObservable()
      .pipe(
        takeUntil(this.destroy$),
        filter((name: string) => name?.length > 3),
        debounceTime(DEBOUNCE_TIME),
      )
      .subscribe((value: string) => {
        this.currentPage = 1;
        this.noMoreSearchResults = false;
        this.lastSearchTerm = value;
        this.selectedResult = null;
        this.search(value);
      });

    this.results$ = this.searchResultEmitter.asObservable();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  ngAfterViewInit() {

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

  addFavorite() {

  }

  showDetail(result: SearchResult) {
    this.loading = true;
    this.searchService.searchById(result.imdbId)
      .subscribe(
        (fullDetails: FullDetails) => this.selectedResult = fullDetails,
        (error: Response) => console.log(error),
      )
      .add(() => this.loading = false);
  }

  private search(value: string): void {

    this.loading = true;
    this.searchService.searchByString(value, this.currentPage)
      .subscribe(
        (response: SearchResponse) => this.onSearchResponse(response),
        (error: Response) => console.error(error),
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
    } else {
      // TODO search that yields no results
    }
  }
}
