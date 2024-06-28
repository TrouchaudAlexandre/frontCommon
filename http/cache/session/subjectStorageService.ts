import {BehaviorSubject, Observable} from 'rxjs';
import {DataStorage, SessionStorage} from "../data-storage.type";

const subjects: Array<BehaviorSubject<DataStorage<any>>> = [];

function getByKey<J>(key: string): Observable<DataStorage<J>> {
  initialiseEmptySession(key);
  return subjects[key].asObservable();
}

function setByKey<J>(key: string, data: J): void {
  initialiseEmptySession(key);
  subjects[key].next({
    data,
    check: false,
  });
}

function setCheckByKey<J>(key: string, data: J): void {
  initialiseEmptySession(key);
  subjects[key].next({
    data,
    check: true,
  });
}

function reinitialiseByKeyword(keywords: string[]): void {
  Object.keys(subjects).forEach((key) => {
    keywords.forEach((keyword) => {
      if (key.includes(keyword)) {
        delete subjects[key];
      }
    });
  });
}

function initialiseEmptySession(key: string): void {
  if (subjects[key] == null) {
    subjects[key] = new BehaviorSubject({
      data: null,
      check: false,
    });
  }
}

export const subjectStorageService: SessionStorage = {
  getByKey,
  setByKey,
  setCheckByKey,
  reinitialiseByKeyword,
};
