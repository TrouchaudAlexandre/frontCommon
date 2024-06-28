import {compressData, decompressData} from "../../dataCompression";
import type {BrowserStorage} from "../data-storage.type";
import moment from 'moment';
import {ExpiredBrowserStorageDuration} from "../../http.type";

const projectIdentifier = import.meta.env.VITE_API_URL ?? 'ls';

interface StoredItem {
  value: string;
  createdAt: string;
  expiredDuration: ExpiredBrowserStorageDuration;
}

function getByKey<T>(key: string): T | null {
  key = `${projectIdentifier}:${key}`;
  const data = localStorage.getItem(key);
  if (data == null || data === '') {
    return null;
  }
  const decompressedData = decompressData(JSON.parse(data).value);
  return JSON.parse(decompressedData);
}

function setByKey<T>(key: string, data: T, expiredDuration: ExpiredBrowserStorageDuration = 'never'): void {
  key = `${projectIdentifier}:${key}`;
  const item: StoredItem = {
    value: compressData(data),
    createdAt: new Date().toISOString().split('T')[0],
    expiredDuration,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function reinitialiseByKeyword(keywords: string[]): void {
  retrieveLocalStorageKeys().forEach((localStorageKey) => {
    keywords.forEach((keyword) => {
      if (localStorageKey.includes(keyword)) {
        localStorage.removeItem(localStorageKey);
      }
    });
  });
}

function retrieveLocalStorageKeys(): string[] {
  const localStorageKey: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) as string;
    if (key.includes(`${projectIdentifier}:`)) {
      localStorageKey.push(key);
    }
  }
  return localStorageKey;
}

function hasExpired(item: StoredItem): boolean {
  const createdAt = moment(item.createdAt);

  switch (item.expiredDuration) {
    case 'daily':
      return moment().diff(createdAt, 'days') >= 1;
    case 'weekly':
      return moment().diff(createdAt, 'weeks') >= 1;
    case 'monthly':
      return moment().diff(createdAt, 'months') >= 1;
    case 'never':
    default:
      return false;
  }
}

function cleanExpiredLocalStorage(): void {
  retrieveLocalStorageKeys().forEach((localStorageKey) => {
    const data = localStorage.getItem(localStorageKey);
    if (data) {
      const parsedData: StoredItem = JSON.parse(data);
      if (hasExpired(parsedData)) {
        localStorage.removeItem(localStorageKey);
      }
    }
  });
}

cleanExpiredLocalStorage()

export const localStorageService: BrowserStorage = {
  getByKey,
  setByKey,
  reinitialiseByKeyword,
};
