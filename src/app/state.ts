import { SearchResult, FullDetails, SearchResponse } from './ombd/ombd.interface';

export interface AppState {
  main: MainState;
}

export interface MainState {
  searchTerm: string;
  searchResponse: SearchResponse,
  searchResults: Array<SearchResult>;
  selectedResult: SearchResult;
  resultDetails: FullDetails;
}
