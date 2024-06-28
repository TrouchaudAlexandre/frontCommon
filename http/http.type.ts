import type { Ref } from 'vue'
import {Observable} from "rxjs";

export interface ResponseState<T> {
  data: Ref<T>,
  loader: Ref<boolean>,
}

export interface HttpRequestConfig {
  headers?: any;
  timeout?: number;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
}

export interface HttpClient {
  get<T>(url: string, params?: any): Observable<HttpResponse<T>>;
  post<T>(url: string, body?: any, config?: HttpRequestConfig): Observable<HttpResponse<T>>;
  patch<T>(url: string, body?: any, config?: HttpRequestConfig): Observable<HttpResponse<T>>;
  setRequestInterceptor(fnInterceptor: RequestInterceptorFn): InterceptorHandler;
}

export interface RequestParameters {
  body?: Record<string, unknown> | FormData | unknown[] | unknown;
  options?: HttpRequestConfig;
  keyWordSubjectToRefresh?: string[];
  params?: Record<string, unknown>;
}

export interface RequestConfig {
  [key: string]: any;
}
export type RequestInterceptorFn = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type InterceptorHandler = {
  eject: (id: number) => void;
};
export type HttpClientMethod = Exclude<keyof HttpClient, 'setRequestInterceptor'>;
export type ExpiredBrowserStorageDuration = 'never' | 'daily' | 'weekly' | 'monthly';
