import { Injectable } from '@angular/core';
import { mergeMap, map, catchError, take, switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';


import { search as searchAction, selectResult, loadMore } from './main.actions';
import { SearchResponse } from '../../services/ombd/ombd.interface';
import { OmbdService } from '../../services/ombd/ombd.service';
import { MainState } from './main.state';
import { searchResponseSelector } from './main.selectors';

@Injectable()
export class MainEffects {
  constructor(
    private actions$: Actions,
    private store: Store<{ main: MainState }>,
    private omdbService: OmbdService,
  ) {
  }

  search$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(searchAction),
        mergeMap(({ searchTerm }) => {
          return this.omdbService.searchByString(searchTerm).pipe(
            map((searchResponse: SearchResponse) => ({ type: '[Main] Search success', searchResponse })),
            catchError(() => EMPTY),
          );
        }),
      );
    }
  );

  resultDetails$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(selectResult),
        mergeMap(({ selectedResult }) => {
          return this.omdbService.searchById(selectedResult.imdbId).pipe(
            map(resultDetails => ({ type: '[Main] Result details success', resultDetails })),
            catchError(() => EMPTY),
          );
        }),
      );
    }
  );

  loadMore$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(loadMore),
        mergeMap(() => {
          return this.store.select(searchResponseSelector).pipe(
            take(1),
            switchMap((searchResponse: SearchResponse) => {
              if (searchResponse.hasNext()) {
                return searchResponse.next().pipe(
                  map((r: SearchResponse) => ({ type: '[Main] Search success', searchResponse: r })),
                  catchError(() => EMPTY),
                );
              } else {
                return EMPTY;
              }
            }),
          );
        }),
      );
    }
  );
}
