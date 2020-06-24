import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { Favorite } from './favorite.interface';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';

const MAX_FAVORITES = 10;
const REPO_KEY = 'movie-search-favorites';

/**
 * Provides favorite search terms management
 */
@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  topThree$: Observable<Array<Favorite>>;

  private favoriteEmitter: BehaviorSubject<Array<Favorite>>;

  constructor(
    // We use this to remember favorites from one page visit to another
    @Inject(LOCAL_STORAGE) private storage: StorageService) {

    this.favoriteEmitter = new BehaviorSubject(this.retrieveFavorites());
    this.topThree$ = this.favoriteEmitter.asObservable()
      .pipe(
        filter((favorites: Array<Favorite>) => !!favorites),
        map((favorites: Array<Favorite>) => this.sortFavorites(favorites).slice(0, 3)),
      );
  }

  isFavorite(term: string) {
    return !!this.favoriteEmitter.value.find(f => f.term === term);
  }

  increment(favorite: string) {

    let currentFavorites: Array<Favorite> = this.favoriteEmitter.value;

    const previouslyExisting: Favorite = currentFavorites.find(f => f.term === favorite);
    if (!!previouslyExisting) {

      previouslyExisting.count++;

    } else {

      if (currentFavorites.length >= MAX_FAVORITES) {
        currentFavorites = this.sortFavorites(currentFavorites).slice(0, MAX_FAVORITES);
      }

      currentFavorites.push({ term: favorite, count: 1 });
    }

    this.favoriteEmitter.next(currentFavorites);
  }

  store(): void {
    this.storage.set(REPO_KEY, this.favoriteEmitter.value);
  }

  private retrieveFavorites(): Array<Favorite> {
    return this.sortFavorites(this.storage.get(REPO_KEY) || []).slice(0, MAX_FAVORITES);
  }

  private sortFavorites(currentFavorites: Favorite[]): Favorite[] {
    return [...currentFavorites].sort((f1: Favorite, f2: Favorite) => f1.count > f2.count ? -1 : (f1.count < f2.count) ? 1 : 0);
  }
}
