import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState, MainState } from './state';

export const mainSelector = createFeatureSelector<AppState, MainState>('main');
export const searchTermSelector = createSelector(mainSelector, (state) => state.searchTerm);
export const searchResponseSelector = createSelector(mainSelector, (state) => state.searchResponse);
export const searchResultsSelector = createSelector(mainSelector, (state: MainState) => state.searchResults);
export const resultDetailsSelector = createSelector(mainSelector, (state: MainState) => state.resultDetails);
