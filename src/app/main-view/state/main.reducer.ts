import { createReducer, on, Action } from '@ngrx/store';
import { MainState } from './main.state';
import { search, selectResult, reset, searchSuccess, resultDetailsSuccess } from './main.actions';

export const initialState: MainState = {
  searchTerm: '',
  searchResponse: null,
  searchResults: [],
  selectedResult: null,
  resultDetails: null,
};

const stateReducer = createReducer(
  initialState,
  on(search, (state, action) => ({ ...state, searchTerm: action.searchTerm })),
  on(searchSuccess, (state, action) => {
    return {
      ...state,
      searchResponse: action.searchResponse,
      searchResults: [...state.searchResults, ...action.searchResponse.results]
    };
  }),
  on(selectResult, (state, { selectedResult }) => ({ ...state, selectedResult })),
  on(resultDetailsSuccess, (state, action) => {
    return {
      ...state,
      resultDetails: action.resultDetails,
    };
  }),
  on(reset, () => initialState),
);

export function mainReducer(state: MainState, action: Action) {
  return stateReducer(state, action);
}
