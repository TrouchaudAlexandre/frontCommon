import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import Axios from 'axios';

import type {
  HttpClient,
  HttpResponse,
  InterceptorHandler,
  RequestConfig,
  RequestInterceptorFn,
  RequestParameters
} from '../http.type'
import {from, Observable} from "rxjs";

export function createAxiosClient(baseURL: string = import.meta.env.VITE_API_URL): HttpClient {
  const client: AxiosInstance = Axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  function adaptConfigForAxios(config: RequestConfig): InternalAxiosRequestConfig {
    return config as unknown as InternalAxiosRequestConfig;
  }

  function adaptConfigFromAxios(config: InternalAxiosRequestConfig): RequestConfig {
    return config as unknown as RequestConfig;
  }

  function setRequestInterceptor(fnInterceptor: RequestInterceptorFn): InterceptorHandler {
    const adaptedInterceptor = (axiosConfig: InternalAxiosRequestConfig) => {
      const customConfig = adaptConfigFromAxios(axiosConfig);
      const resultConfig = fnInterceptor(customConfig);
      if (resultConfig instanceof Promise) {
        return resultConfig.then(adaptConfigForAxios);
      }
      return adaptConfigForAxios(resultConfig);
    };

    const id = client.interceptors.request.use(adaptedInterceptor);

    return {
      eject: () => client.interceptors.request.eject(id)
    };
  }


  function get<T>(url: string, requestParameters: RequestParameters): Observable<HttpResponse<T>> {
    return from(client.get<T>(url, { params: requestParameters.params }).then(toHttpResponse));
  }

  function post<T>(url: string, requestParameters: RequestParameters): Observable<HttpResponse<T>> {
    return from(client.post<T>(url, requestParameters.body, requestParameters.options).then(toHttpResponse));
  }

  function patch<T>(url: string, requestParameters: RequestParameters): Observable<HttpResponse<T>> {
    return from(client.patch<T>(url, requestParameters.body, requestParameters.options).then(toHttpResponse));
  }

  return { get, post, patch, setRequestInterceptor};
}

function toHttpResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
  return {
    data: response.data,
    status: response.status,
  };
}
