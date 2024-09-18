import {Resolutions} from "../../input-output-types/video-types";

export const videoAvailableResolutionsValidatorCustom = (resolutions: Resolutions[]) => {
  if (resolutions.some(res => !Resolutions[res])) {
    throw new Error('One or more resolutions are invalid');
  }
  return true;
}