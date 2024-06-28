import type {RequestParameters} from "./http.type";

export function buildKeyFromArguments(path: string, args?: RequestParameters): string {
  if (args == null) {
    return path;
  }

  let key = path;
  if (args.body) {
    key += `-${JSON.stringify(args.body)}`;
  }
  if (args.params) {
    key += `-${JSON.stringify(args.params)}`;
  }
  if (args.keyWordSubjectToRefresh) {
    key += `-${JSON.stringify(args.keyWordSubjectToRefresh)}`;
  }
  return key;
}
