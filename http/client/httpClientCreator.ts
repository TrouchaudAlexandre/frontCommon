import type {HttpClient} from "../http.type";
import {createAxiosClient} from "./axiosClient";

export function createHttpClient(url?: string): HttpClient {
  return createAxiosClient(url);
}

export const httpClient = createHttpClient();
