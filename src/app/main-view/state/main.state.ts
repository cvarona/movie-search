import { SearchResponse, SearchResult, FullDetails } from '../../services/ombd/ombd.interface';

export interface MainState {
  searchTerm: string;
  searchResponse: SearchResponse,
  searchResults: Array<SearchResult>;
  selectedResult: SearchResult;
  resultDetails: FullDetails;
}
