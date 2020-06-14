export type OmdbResultType = 'movie' | 'series' | 'episode';

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
}

export interface OmdbResult {
  Poster: string;
  Title: string;
  Type: OmdbResultType;
  Year: string;
  imdbID: string;
}

export interface OmdbResponse {
  Response: 'True' | 'False';
  Search: Array<OmdbResult>;
  totalResults: number;
}

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

export interface SearchResult {
  poster: string;
  title: string;
  type: OmdbResultType;
  year: string;
  imdbId: string;
}

export interface SearchResponse {
  results: Array<SearchResult>;
  page: number;
  nextPage: number;
}
