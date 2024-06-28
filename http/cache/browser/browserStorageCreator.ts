import type {BrowserStorage} from "../data-storage.type";
import {localStorageService} from "./localStorageService";

export function createBrowserStorage(): BrowserStorage {
  return localStorageService;
}
