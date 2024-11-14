import {ResultStatus} from "./resultCode";

export type Result<T = null> = {
    status: ResultStatus;
    errorMessage?: string;
    extensions?: [{ field: 'id', message: '' }]
    data: T
}
