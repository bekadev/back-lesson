import {Request, Response, Router} from 'express'
import {InputVideoType, OutputVideoUpdatedType} from "../../input-output-types/video-types";
import {OutputErrorsType} from "../../input-output-types/output-errors-type";
import {videosRepo} from "../../features/videos/repo";
import {InputValidationMiddleware} from "../../middleware/input-validation-middleware";
import {
  videoAuthorValidator,
  videoAvailableResolutionsValidator,
  videoCanBeDownloadedValidator,
  videoMinAgeRestrictionValidator, videoPublicationDateValidator,
  videoTitleValidator
} from "../../validations/express-validator/field-validator";
import {adminMiddleware} from "../../middleware/auth-middleware";
export const videosRouter = Router()

const videoController = {
    getVideos: (req: Request, res: Response<any /*OutputVideoType[]*/>) => {
        const videos = videosRepo.getAllVideos()

      if (videos.length){
        res
          .status(200)
          .json(videos)
      } else {
        res.sendStatus(404)
      }
    },
    createVideo: (req: Request<any, any, InputVideoType>, res: Response<any /*OutputVideoType*/ | OutputErrorsType>) => {
      const newVideo = videosRepo.createdNewVideo(req.body)

      res
        .status(201)
        .send(newVideo)
    },
    findVideo: (req: Request, res: Response<any>) => {
    const video = videosRepo.findVideo(+req.params.id)

    if (video){
      res.send(video)
    } else {
      res.sendStatus(404)
    }
  },
    deleteVideo: (req: Request, res: Response<any>) => {
    const isDeleted = videosRepo.deleteVideo(+req.params.id)

      if (isDeleted) {
        res.sendStatus(204)
      } else {
        res.sendStatus(404)
      }
  },
    updateVideo: (req: Request<any, any, OutputVideoUpdatedType>, res: Response<any>) => {
    const video =  videosRepo.updateVideo(+req.params.id, req.body)

    if (video) {
      res
        .status(204)
        .send(video)
    } else {
      res.sendStatus(404)
    }
  }
}

videosRouter.get('/', videoController.getVideos)
videosRouter.post('/',
  videoAuthorValidator,
  videoTitleValidator,
  videoAvailableResolutionsValidator,
  adminMiddleware,
  videoController.createVideo
)
videosRouter.get('/:id', videoController.findVideo)
videosRouter.put('/:id',
  videoTitleValidator,
  videoMinAgeRestrictionValidator,
  videoCanBeDownloadedValidator,
  videoAuthorValidator,
  videoAvailableResolutionsValidator,
  videoPublicationDateValidator,
  InputValidationMiddleware,
  videoController.updateVideo
)
videosRouter.delete('/:id', videoController.deleteVideo)
