import {body} from "express-validator";
import {videoAvailableResolutionsValidatorCustom} from "../../validations/custom";

const videoTitleValidator = body('title')
  .trim()
  .isString()
  .notEmpty()
  .isLength({min:1, max:40})
  .withMessage({ message: 'Error Title', field: "title" })

const videoAuthorValidator = body('author')
  .trim()
  .isString()
  .notEmpty()
  .isLength({min:1, max:20})
  .withMessage({ message: 'Error Author', field: "author" })

const videoPublicationDateValidator = body('publicationDate')
  .isISO8601()
  .isString()
  .withMessage({ message: 'Error publicationDate', field: "publicationDate" })


const videoAvailableResolutionsValidator = body('availableResolutions')
  .isArray()
  .custom(videoAvailableResolutionsValidatorCustom)
  .withMessage({ message: 'One or more resolutions are invalid', field: 'availableResolutions' });


const videoMinAgeRestrictionValidator = body('minAgeRestriction')
  .optional({nullable: true})
  .isInt({min: 1, max: 18})
  .withMessage({ message: 'Error minAgeRestriction', field: "minAgeRestriction" })

const videoCanBeDownloadedValidator = body('canBeDownloaded')
  .optional()
  .isBoolean()
  .withMessage({ message: 'Error canBeDownloaded', field: "canBeDownloaded" })

const bekaTheBest = () => {
    console.log('bekaTheBest')
}



export {bekaTheBest,videoAuthorValidator, videoPublicationDateValidator, videoTitleValidator, videoAvailableResolutionsValidator, videoMinAgeRestrictionValidator, videoCanBeDownloadedValidator}