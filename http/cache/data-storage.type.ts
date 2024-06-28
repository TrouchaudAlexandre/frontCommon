import type {Observable} from 'rxjs';

export interface Storage {
  setByKey<T>(key: string, data: T): void;
  reinitialiseByKeyword(keywords: string[]): void;
}

export interface SessionStorage extends Storage {
  getByKey<T>(key: string): Observable<DataStorage<T>>;
  setCheckByKey<J>(key: string, data: J): void;
}
export interface BrowserStorage extends Storage {
  getByKey<T>(key: string): T | null;
}

export interface DataStorage<T> {
  data: T;
  check: boolean;
}
