import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Hero } from "./hero";
import { Observable, of } from "rxjs";
import { MessageService } from "./message.service";
import { catchError, map, tap } from "rxjs/operators";
import { trimTrailingNulls } from "@angular/compiler/src/render3/view/util";

@Injectable({
  providedIn: "root"
})
export class HeroService {
  private heroesUrl = "api/heroes";
  private httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" })
  };
  constructor(
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  getHeroes(): Observable<Hero[]> {
    this.log("HeroService: heroes fetched");
    return this.http.get<Hero[]>(this.heroesUrl).pipe(
      tap(_ => this.log("heroes fetched")),
      catchError(this.handleErrors<Hero[]>("get heroes", []))
    );
  }

  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`hero fetched id= ${id}`)),
      catchError(this.handleErrors<Hero>(`getHero id= ${id}`))
    );
  }

  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions).pipe(
      tap(_ => this.log(`hero updated id=${hero.id}`)),
      catchError(this.handleErrors<any>("updateHero"))
    );
  }

  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions).pipe(
      tap((newHero: Hero) => this.log(`added hero with id= ${newHero.id}`)),
      catchError(this.handleErrors<Hero>("addHero"))
    );
  }

  deleteHero(hero: Hero | number): Observable<Hero> {
    const id = typeof hero === "number" ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted hero id= ${id}`)),
      catchError(this.handleErrors<Hero>("deleteHero"))
    );
  }

  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.http
      .get<Hero[]>(`${this.heroesUrl}/?name=${term}`)
      .pipe(
        tap(
          x =>
            x.length
              ? this.log(`found heroes matching "${term}"`)
              : this.log(`no heroes matching "${term}"`),
          catchError(this.handleErrors<Hero[]>("searchHeroes", []))
        )
      );
  }

  private handleErrors<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  /*getHero(id: number): Observable<Hero> {
    this.messageService.add(`fetched hero id=${id}`);
  }*/

  private log(message: string): void {
    this.messageService.add(message);
  }
}
