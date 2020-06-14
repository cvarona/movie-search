import { Inject, Injectable, ViewChild } from '@angular/core';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { Favorite } from './favorite.interface';
import { Observable, BehaviorSubject } from 'rxjs';

const REPO_KEY = 'movie-search-favorites';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  topThree$: Observable<Array<Favorite>>;

  private topThreeEmitter: BehaviorSubject<Array<Favorite>>;

  constructor(
    @Inject(LOCAL_STORAGE) private storage: StorageService) {

    this.topThreeEmitter = new BehaviorSubject(this.topThree());
    this.topThree$ = this.topThreeEmitter.asObservable();
  }

  isFavorite(term: string) {
    return !!this.retrieveFavorites().find(f => f.term === term);
  }

  store(favorite: Favorite): void {
    const currentFavorites: Array<Favorite> = this.storage.get(REPO_KEY) || [];

    const previouslyExisting: Favorite = currentFavorites.find(f => f.term === favorite.term);
    if (!!previouslyExisting) {
      previouslyExisting.count = favorite.count;
    } else {
      currentFavorites.push(favorite);
    }

    this.storage.set(REPO_KEY, currentFavorites);
  }

  increment(favorite: string) {
    const currentFavorites: Array<Favorite> = this.storage.get(REPO_KEY) || [];

    const previouslyExisting: Favorite = currentFavorites.find(f => f.term === favorite);
    if (!!previouslyExisting) {
      previouslyExisting.count++;
    } else {
      currentFavorites.push({ term: favorite, count: 1 });
    }

    this.sortFavorites(currentFavorites);

    this.storage.set(REPO_KEY, currentFavorites);
    this.topThreeEmitter.next([...currentFavorites.slice(0, 3)]);
  }

  topThree(): Array<Favorite> {

    const currentFavorites: Array<Favorite> = this.retrieveFavorites();
    currentFavorites.sort((f1: Favorite, f2: Favorite) => f1.count > f2.count ? -1 : (f1.count < f2.count) ? 1 : 0);

    return currentFavorites.slice(0, 3);
  }

  private retrieveFavorites(): Array<Favorite> {
    return this.storage.get(REPO_KEY) || [];
  }

  private sortFavorites(currentFavorites: Favorite[]) {
    currentFavorites.sort((f1: Favorite, f2: Favorite) => f1.count > f2.count ? -1 : (f1.count < f2.count) ? 1 : 0);
  }
}
