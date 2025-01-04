import type { ResultStatus } from "./resultCode";

export type ExtensionType = {
  field: string | null;
  message: string;
};

// export type Result<T = null> = {
// 	status: ResultStatus;
// 	errorMessage?: string;
// 	extensions: ExtensionType[];
// 	data: T;
// };

export type ResultType<T = null> = {
  status: ResultStatus;
  errorMessage?: string;
  extensions: ExtensionType[];
  data: T;
};
