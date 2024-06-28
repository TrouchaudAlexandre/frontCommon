import {createSessionStorage} from "./cache/session/sessionStorageCreator";
import {createBrowserStorage} from "./cache/browser/browserStorageCreator";
import type { HttpClientMethod, HttpResponse, RequestParameters } from './http.type'
import {httpClient} from "./client/httpClientCreator";
import {buildKeyFromArguments} from "./KeyBuilder";
import type {DataStorage} from "./cache/data-storage.type";
import {Observable, of} from "rxjs";
import {map, switchMap, tap} from "rxjs/operators";

interface HttpService {
    get<T>(path: string, parameters?: RequestParameters): Observable<T>;
    post<T>(path: string, parameters: RequestParameters): Observable<T>;
    patch<T>(path: string, parameters: RequestParameters): Observable<T>;
    getAndSavedInSession<T>(path: string, args?: RequestParameters): Observable<T>;
    postAndSavedInSession<T>(path: string, args?: RequestParameters): Observable<T>;
    getAndSavedInBrowser<T>(path: string, args?: RequestParameters): Observable<T>;
    postAndSavedInBrowser<T>(path: string, args?: RequestParameters): Observable<T>;
}

const sessionStorageService = createSessionStorage();
const browserStorageService = createBrowserStorage();

export function useHttpService(): HttpService {

    function get<T>(path: string, parameters?: RequestParameters): Observable<T> {
        return httpClient.get<T>(`${path}`, parameters?.params ?? {}).pipe(
            map(returnOnlyDataFromApiResponse)
        );
    }

    function post<T>(
      path: string,
      requestParameters: RequestParameters,
    ): Observable<T> {
        reinitialiseStorageByKeyword(requestParameters.keyWordSubjectToRefresh);
        return httpClient.post<T>(
          `${path}`,
          requestParameters
        ).pipe(
            map(returnOnlyDataFromApiResponse)
        );
    }

    function patch<T>(
      path: string,
      {
          body,
          options,
          keyWordSubjectToRefresh,
      }: RequestParameters,
    ): Observable<T> {
        reinitialiseStorageByKeyword(keyWordSubjectToRefresh);
        return httpClient.patch<T>(
          `${path}`,
          body,
          options,
        ).pipe(
            map(returnOnlyDataFromApiResponse)
        );
    }

    function getAndSavedInSession<T>(path: string, args?: RequestParameters): Observable<T> {
        return saveInSession('get', path, args ?? {});
    }

    function postAndSavedInSession<T>(path: string, args?: RequestParameters): Observable<T> {
        return saveInSession('post', path, args ?? {});
    }

    function getAndSavedInBrowser<T>(path: string, args?: RequestParameters): Observable<T> {
        return saveInBrowser('get', path, args ?? {});
    }

    function postAndSavedInBrowser<T>(path: string, args?: RequestParameters): Observable<T> {
        return saveInBrowser('post', path, args ?? {});
    }

    function saveInSession<T>(method: HttpClientMethod, path: string, args: RequestParameters): Observable<T> {
        const key = buildKeyFromArguments(path, args);

        return sessionStorageService.getByKey<T>(key)
            .pipe(
                switchMap((sessionData: DataStorage<T>) => {
                    if (sessionData?.data != null) {
                        return of(sessionData.data);
                    } else {
                        return performApiCall<T>(method, path, args, key);
                    }
                }),
            );
    }

    function saveInBrowser<T>(method: string, path: string, args: RequestParameters): Observable<T> {
        const key = buildKeyFromArguments(path, args);

        return sessionStorageService.getByKey(key)
            .pipe(
                // @ts-ignore
                switchMap((dataFromSession: DataStorage<T>): Observable<T> => {
                    if (isValidSessionData(dataFromSession)) {
                        return of(dataFromSession.data);
                    } else {
                        return handleBrowserStorageData<T>(method, path, args, key);
                    }
                }),
            );
    }

    function performApiCall<T>(method: string, path: string, args: RequestParameters, key: string): Observable<T> {
        return useHttpService()[method](path, args ?? {}).pipe(
            tap((apiResult) => {
                sessionStorageService.setByKey(key, apiResult);
            }),
        );
    }

    function handleBrowserStorageData<T>(
        method: string,
        path: string,
        args: RequestParameters,
        key: string,
    ): Observable<T> {
        const dataFromBrowser = browserStorageService.getByKey(key);

        if (dataFromBrowser != null && dataFromBrowser !== '') {
            useHttpService()[method](path, args).pipe(
                tap((resultFromAPI) => {
                    if (JSON.stringify(resultFromAPI) !== JSON.stringify(dataFromBrowser)) {
                        browserStorageService.setByKey(key, resultFromAPI);
                    }
                    sessionStorageService.setCheckByKey(key, resultFromAPI);
                }),
            ).subscribe();
            return of(dataFromBrowser as T);
        } else {
            return useHttpService()[method](path, args).pipe(
                tap((apiResult) => {
                    sessionStorageService.setCheckByKey(key, apiResult);
                    browserStorageService.setByKey(key, apiResult);
                }),
            );
        }
    }

    function reinitialiseStorageByKeyword(keywords: string[] | undefined): void {
        if (keywords == null) {
            return;
        }
        sessionStorageService.reinitialiseByKeyword(keywords);
        browserStorageService.reinitialiseByKeyword(keywords);
    }

    function isValidSessionData<T>(sessionData: DataStorage<T>): boolean {
        return sessionData?.data != null && sessionData.check;
    }

    function returnOnlyDataFromApiResponse<T>(response: HttpResponse<T>): T {
        return response.data;
    }

    return {
        getAndSavedInSession,
        getAndSavedInBrowser,
        postAndSavedInBrowser,
        postAndSavedInSession,
        patch,
        post,
        get
    }
}
