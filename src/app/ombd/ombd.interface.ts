import { Observable } from 'rxjs';

export type OmdbResultType = 'movie' | 'series' | 'episode';

/**
 * The search by id/name result data structure provided
 * by the omdb, as guessed from testing
 */
export interface OmdbFullDetails {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: 'True' | 'False';
  Error: string;
}

// Same as above for term searches
export interface OmdbResult {
  Poster: string;
  Title: string;
  Type: OmdbResultType;
  Year: string;
  imdbID: string;
}

export interface OmdbResponse {
  Response: 'True' | 'False';
  Error: string;
  Search: Array<OmdbResult>;
  totalResults: number;
}

/** The movie search app's own result search details data structure */
export interface FullDetails {
  title: string;
  year: string;
  rated: string;
  released: string;
  runtime: string;
  genre: string;
  director: string;
  writer: string;
  actors: string;
  plot: string;
  language: string;
  country: string;
  poster: string;
  website: string;
  imdbId: string;
}

// Same as above for term searches
export interface SearchResult {
  title: string;
  imdbId: string;
}

export interface SearchResponse {
  searchTerm: string;
  results: Array<SearchResult>;
  page: number;
  hasNext: () => boolean;
  next: () => Observable<SearchResponse>;
}

export const MINIMUM_SEARCH_TERM_LENGTH = 3;
