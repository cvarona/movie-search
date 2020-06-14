import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OmdbResponse, SearchResponse, OmdbFullDetails, FullDetails } from './ombd.interface';
import { mokkedSearchResponse, mokkedDetail } from './omdb.mokks';

const useMokks = false;
const MINIMUM_LENGTH = 3;

@Injectable({
  providedIn: 'root'
})
export class OmbdService {

  private key = 'e2ef84a7';
  private apiUrl = 'http://www.omdbapi.com/';

  constructor(private http: HttpClient) { }

  searchByString(term: string, page = 1): Observable<SearchResponse> {

    if (term?.trim()?.length < MINIMUM_LENGTH) {
      throw Error(`The provided search string should have at least ${MINIMUM_LENGTH} characters`);
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

        if (omdbResponse.Response === 'True') {

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
