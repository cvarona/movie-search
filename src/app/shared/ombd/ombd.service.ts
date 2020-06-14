import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OmdbResponse, SearchResponse, OmdbFullDetails, FullDetails } from './ombd.interface';

const MINIMUM_LENGTH = 3;

const NO_RESULTS = {
  results: [],
  page: -1,
  nextPage: -1,
};

@Injectable({
  providedIn: 'root'
})
export class OmbdService {

  private key = 'e2ef84a7';
  private apiUrl = 'http://www.omdbapi.com/';

  constructor(private http: HttpClient) { }

  searchByString(name: string, page = 1): Observable<SearchResponse> {

    if (name?.trim()?.length < MINIMUM_LENGTH) {
      throw Error(`The provided search string should have at least ${MINIMUM_LENGTH} characters`);
    }

    return this.http.get<OmdbResponse>(
      this.apiUrl,
      {
        params: {
          apikey: this.key,
          s: name,
          page: page.toString(),
        }
      }
    ).pipe(
      map((omdbResponse: OmdbResponse) => {

        if (omdbResponse.Response === 'True') {
          return {
            results: omdbResponse.Search.map(omdbr => ({
              poster: omdbr.Poster,
              title: omdbr.Title,
              type: omdbr.Type,
              year: omdbr.Year,
              imdbId: omdbr.imdbID,
            })),
            page,
            nextPage: (page * 10) < omdbResponse.totalResults ? page + 1 : -1,
          };
        }

        return NO_RESULTS;
      })
    );
  }

  searchById(id: string): Observable<FullDetails> {
    return this.http.get<OmdbFullDetails>(
      this.apiUrl,
      {
        params: {
          apikey: this.key,
          i: id,
        }
      }
    ).pipe(
      map((omdbFullDetails: OmdbFullDetails) => {

        if (omdbFullDetails.Response === 'True') {
          return {
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
            poster: omdbFullDetails.Poster,
            website: omdbFullDetails.Website,
          };
        }

        return null;
      })
    );
  }
}
