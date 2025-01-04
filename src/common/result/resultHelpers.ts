import { HttpStatuses } from "../types/httpStatuses";
import type { ResultType, ExtensionType } from "./result.type";
import { ResultStatus } from "./resultCode";

export const resultHelpers = {
  success<T>(data: T, extensions?: ExtensionType[]): ResultType<T> {
    return {
      status: ResultStatus.Success,
      extensions: extensions || [],
      data,
    };
  },

  badRequest(extension: ExtensionType): ResultType {
    return {
      status: ResultStatus.BadRequest,
      extensions: [extension],
      data: null,
    };
  },

  notFound(extension?: ExtensionType): ResultType {
    return {
      status: ResultStatus.NotFound,
      extensions: extension ? [extension] : [],
      data: null,
    };
  },

  unauthorized(extension?: ExtensionType): ResultType {
    return {
      status: ResultStatus.Unauthorized,
      extensions: extension ? [extension] : [],
      data: null,
    };
  },

  forbidden(extension?: ExtensionType): ResultType {
    return {
      status: ResultStatus.Forbidden,
      extensions: extension ? [extension] : [],
      data: null,
    };
  },

  tooManyRequests(): ResultType {
    return {
      status: ResultStatus.TooManyRequests,
      extensions: [],
      data: null,
    };
  },

  isSuccess<T>(result: ResultType<T | null>): result is ResultType<T> {
    return result.status === ResultStatus.Success;
  },

  isNotSuccess<T>(result: ResultType<T | null>): result is ResultType {
    return !result.data && result.status !== ResultStatus.Success;
  },

  resultCodeToHttpException(resultCode: ResultStatus): HttpStatuses {
    switch (resultCode) {
      case ResultStatus.BadRequest:
        return HttpStatuses.BadRequest;
      case ResultStatus.Forbidden:
        return HttpStatuses.Forbidden;
      case ResultStatus.NotFound:
        return HttpStatuses.NotFound;
      case ResultStatus.Unauthorized:
        return HttpStatuses.Unauthorized;
      case ResultStatus.TooManyRequests:
        return HttpStatuses.TooManyRequests;
      default:
        return HttpStatuses.ServerError;
    }
  },
};
