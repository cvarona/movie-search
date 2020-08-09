import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OmdbResponse, SearchResponse, OmdbFullDetails, FullDetails, MINIMUM_SEARCH_TERM_LENGTH } from './ombd.interface';
import { mokkedSearchResponse, mokkedDetail } from './omdb.mokks';

const useMokks = false;

/**
 * Provides access to the remote omdb api
 */
@Injectable({
  providedIn: 'root'
})
export class OmbdService {

  private key = 'e2ef84a7';
  private apiUrl = 'http://www.omdbapi.com/';

  constructor(private http: HttpClient) { }

  // The omdb accepts 1-based page indexes for term searches
  searchByString(term: string, page = 1): Observable<SearchResponse> {

    if (term?.trim()?.length < MINIMUM_SEARCH_TERM_LENGTH) {
      throw Error(`The provided search string should have at least ${MINIMUM_SEARCH_TERM_LENGTH} characters`);
    }

    const request$: Observable<OmdbResponse> = useMokks ?
      of(mokkedSearchResponse) :
      this.http.get<OmdbResponse>(
        this.apiUrl,
        {
          params: {
            apikey: this.key,
            s: term,
            page: page.toString(),
          }
        }
      );

    return request$.pipe(
      switchMap((omdbResponse: OmdbResponse) => {

        // 'True' means that the search has succeeded and
        // has yielded at least one result
        if (omdbResponse.Response === 'True') {

          // We compute the next page and translate the omdb response property
          // names into those of the movie-search app
          const nextPage = (page * 10) < omdbResponse.totalResults ? page + 1 : -1;

          return of({
            searchTerm: term,
            results: omdbResponse.Search.map(omdbr => ({
              title: omdbr.Title,
              imdbId: omdbr.imdbID,
            })),
            page,
            hasNext: () => nextPage !== -1,
            next: () => {
              return nextPage === -1 ? throwError('Should not happen') : this.searchByString(term, nextPage);
            },
          });
        }

        // Response 'False' means that something has been wrong or that the search yields no
        // results; since we'll be visually handling the latter the same as an error, we translate
        // both into an error emission
        return throwError(omdbResponse.Error);
      })
    );
  }

  searchById(id: string): Observable<FullDetails> {

    const request$: Observable<OmdbFullDetails> = useMokks ?
      of(mokkedDetail) :
      this.http.get<OmdbFullDetails>(
        this.apiUrl,
        {
          params: {
            apikey: this.key,
            i: id,
          }
        }
      );

    return request$.pipe(
      switchMap((omdbFullDetails: OmdbFullDetails) => {

        if (omdbFullDetails.Response === 'True') {
          return of({
            title: omdbFullDetails.Title,
            year: omdbFullDetails.Year,
            rated: omdbFullDetails.Rated,
            released: omdbFullDetails.Released,
            runtime: omdbFullDetails.Runtime,
            genre: omdbFullDetails.Genre,
            director: omdbFullDetails.Director,
            writer: omdbFullDetails.Writer,
            actors: omdbFullDetails.Actors,
            plot: omdbFullDetails.Plot,
            language: omdbFullDetails.Language,
            country: omdbFullDetails.Country,
            poster: omdbFullDetails.Poster === 'N/A' ? null : omdbFullDetails.Poster,
            website: omdbFullDetails.Website,
            imdbId: omdbFullDetails.imdbID,
          });
        }

        return throwError(omdbFullDetails.Error);
      })
    );
  }
}
