import {Request, Response, Router} from 'express'
import {db} from "../db/db";
import {InputVideoType, OutputVideoType, Resolutions} from "../input-output-types/video-types";
import {OutputErrorsType} from "../input-output-types/output-errors-type";
import dateFns from "date-fns"
export const videosRouter = Router()

const inputValidation = (video: InputVideoType) => {
  const errors: OutputErrorsType = {
    errorsMessages: []
  }
  if (!Array.isArray(video.availableResolutions)) {
    console.log('1')
    errors.errorsMessages.push({
      message: 'error!!!!', field: 'availableResolution'
    })
  }
  console.log(video)
    if (video.availableResolutions.find(p => !Resolutions[p]))  {
      console.log('2')
      errors.errorsMessages.push({
        message: 'error!!!!', field: 'availableResolution'
      })
  }
  return errors
}

const videoController = {
    getVideos: (req: Request, res: Response<any /*OutputVideoType[]*/>) => {
        const videos = db.videos // получаем видео из базы данных

        res
            .status(200)
            .json(videos) // отдаём видео в качестве ответа
    },
    createVideo: (req: Request<any, any, InputVideoType>, res: Response<any /*OutputVideoType*/ | OutputErrorsType>) => {
      const errors = inputValidation(req.body)
      if (errors.errorsMessages.length) { // если есть ошибки - отправляем ошибки
        res
          .status(400)
          .json(errors)
        return
        // return res.status(400).json(errors)
      }
      const createdAt = new Date().toISOString()
      // если всё ок - добавляем видео
      const newVideo: OutputVideoType /*VideoDBType*/ = {
        id: Date.now(),
        title: req.body.title,
        author: req.body.author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt,
        publicationDate: dateFns.addDays(createdAt, 1).toISOString(),
        availableResolutions: req.body.availableResolutions,
      }
      db.videos = [...db.videos, newVideo]

      res
        .status(201)
        .send(newVideo)
    },
  findVideo: (req: Request, res: Response<any>) => {
    const video = db.videos.find(p => p.id === +req.params.id)

    if (video){
      res.send(video)
    } else {
      res.status(404)
    }
  },
  deleteVideo: (req: Request, res: Response<any>) => {
      for (let i = 0; i < db.videos.length; i++) {
        if (db.videos[i].id === +req.params.id) {
          db.videos.splice(i, 1)
          res.sendStatus(204)
          return
        }
      }
    res.sendStatus(404)
  },
  updateVideo: (req: Request, res: Response<any>) => {
    const video = db.videos.find(p => p.id === +req.params.id)

    if (video) {
        video.title =  req.body.title
        video.author = req.body.author
        video.availableResolutions = req.body.availableResolutions
        video.canBeDownloaded = req.body.canBeDownloaded
        video.minAgeRestriction = req.body.minAgeRestriction
        video.publicationDate = req.body.publicationDate
      res.send(video)
    } else {
      res.sendStatus(404)
    }
  }
}

videosRouter.get('/', videoController.getVideos)
videosRouter.post('/', videoController.createVideo)
videosRouter.get('/:id', videoController.findVideo)
videosRouter.put('/:id', videoController.updateVideo)
videosRouter.delete('/:id', videoController.deleteVideo)
