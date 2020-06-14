import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { OmdbResponse, SearchResponse, OmdbFullDetails, FullDetails } from './ombd.interface';

const MINIMUM_LENGTH = 3;

const NO_RESULTS = {
  results: [],
  page: -1,
  nextPage: -1,
};

const mokkedSearchResponse = {"Search":[{"Title":"Indiana Jones and the Temple of Doom","Year":"1984","imdbID":"tt0087469","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BMGI1NTk2ZWMtMmI0YS00Yzg0LTljMzgtZTg4YjkyY2E5Zjc0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg"},{"Title":"Doom","Year":"2005","imdbID":"tt0419706","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BN2QwMzZiYmUtNGZhMC00ZjA2LWI2MDYtOWEyNDA4MzYwMTBiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg"},{"Title":"Justice League: Doom","Year":"2012","imdbID":"tt2027128","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BOTFlMzdkMDgtNzJmZC00ZmE3LThkYzktNGZmNmMzZmNhYmY5XkEyXkFqcGdeQXVyNDYwMjI1MzI@._V1_SX300.jpg"},{"Title":"Doom Patrol","Year":"2019–","imdbID":"tt8416494","Type":"series","Poster":"https://m.media-amazon.com/images/M/MV5BM2I1OWZiNTUtZGNmOS00NGNiLTlhZmItOTU3MGRlMWFkYWU3XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg"},{"Title":"The Doom Generation","Year":"1995","imdbID":"tt0112887","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BYjEwZDUyODktOGVmOC00ZjIyLTlmM2YtZDZjY2Y2ZWE4ZjMyXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg"},{"Title":"From Doom Till Doom","Year":"1988","imdbID":"tt0095936","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BZDAwM2E2YmEtN2I3Zi00NmY5LTkxNTAtODVmNmM4MmY2YTFjXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX300.jpg"},{"Title":"The Sword of Doom","Year":"1966","imdbID":"tt0060277","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BM2E5ZGVkMTUtMmUyOS00ZGNiLTk5ZGUtYjAyZTljZThiNTJiXkEyXkFqcGdeQXVyMTIyNzY1NzM@._V1_SX300.jpg"},{"Title":"Doom: Annihilation","Year":"2019","imdbID":"tt8328716","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BNzc3ZWIwYjktZWE1ZC00MTRlLWE1NzUtYTYzYjJlNmMyYTZhXkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_SX300.jpg"},{"Title":"Doom","Year":"1993","imdbID":"tt0286598","Type":"game","Poster":"https://m.media-amazon.com/images/M/MV5BZTY5OWVkN2ItZDgzNS00ZjVmLTg0OGUtZWUwNjZhZTBjYmU4XkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg"},{"Title":"Omega Doom","Year":"1996","imdbID":"tt0117238","Type":"movie","Poster":"https://m.media-amazon.com/images/M/MV5BNGRhMzYyNTAtYWZmYi00NzQwLWI4OTktYTRhM2Y5OTEwNWIzXkEyXkFqcGdeQXVyNjQ2MjQ5NzM@._V1_SX300.jpg"}],"totalResults":184,"Response":"True"};
const mokkedDetail = {"Title":"Indiana Jones and the Temple of Doom","Year":"1984","Rated":"PG","Released":"23 May 1984","Runtime":"118 min","Genre":"Action, Adventure","Director":"Steven Spielberg","Writer":"Willard Huyck (screenplay by), Gloria Katz (screenplay by), George Lucas (story by)","Actors":"Harrison Ford, Kate Capshaw, Ke Huy Quan, Amrish Puri","Plot":"In 1935, Indiana Jones arrives in India, still part of the British Empire, and is asked to find a mystical stone. He then stumbles upon a secret cult committing enslavement and human sacrifices in the catacombs of an ancient palace.","Language":"English, Sinhalese, Hindi","Country":"USA","Awards":"Won 1 Oscar. Another 10 wins & 21 nominations.","Poster":"https://m.media-amazon.com/images/M/MV5BMGI1NTk2ZWMtMmI0YS00Yzg0LTljMzgtZTg4YjkyY2E5Zjc0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg","Ratings":[{"Source":"Internet Movie Database","Value":"7.6/10"},{"Source":"Rotten Tomatoes","Value":"85%"},{"Source":"Metacritic","Value":"57/100"}],"Metascore":"57","imdbRating":"7.6","imdbVotes":"432,362","imdbID":"tt0087469","Type":"movie","DVD":"N/A","BoxOffice":"N/A","Production":"N/A","Website":"N/A","Response":"True"};
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

    /*return this.http.get<OmdbResponse>(
      this.apiUrl,
      {
        params: {
          apikey: this.key,
          s: name,
          page: page.toString(),
        }
      }
    )*/
    return of(mokkedSearchResponse).pipe(
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
     /*this.http.get<OmdbFullDetails>(
      this.apiUrl,
      {
        params: {
          apikey: this.key,
          i: id,
        }
      }
    )*/
    return of(mokkedDetail as OmdbFullDetails).pipe(
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
