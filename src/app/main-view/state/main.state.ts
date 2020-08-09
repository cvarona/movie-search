import { SearchResponse, SearchResult, FullDetails } from 'src/app/ombd/ombd.interface';

export interface MainState {
  searchTerm: string;
  searchResponse: SearchResponse,
  searchResults: Array<SearchResult>;
  selectedResult: SearchResult;
  resultDetails: FullDetails;
}
