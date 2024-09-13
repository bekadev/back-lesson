import {Request, Response, Router} from 'express'
import {db} from "../db/db";
import {InputVideoType, OutputVideoType, OutputVideoUpdatedType, Resolutions} from "../input-output-types/video-types";
import {OutputErrorsType} from "../input-output-types/output-errors-type";
import dateFns from "date-fns"
export const videosRouter = Router()

const outputValidation = (video: OutputVideoUpdatedType) => {
  const errors: OutputErrorsType = {
    errorsMessages: []
  }

  if (typeof video.title === null && typeof video.title !== 'string' ) {
    errors.errorsMessages.push({
      message: 'Title must be a non-empty string',
      field: 'title'
    });
  }

  if (typeof video.author !== 'string' || !video.author.trim()) {
    errors.errorsMessages.push({
      message: 'Author must be a non-empty string',
      field: 'author'
    });
  }

  if (!Array.isArray(video.availableResolutions)) {
    errors.errorsMessages.push({
      message: 'Available Resolutions must be an array',
      field: 'availableResolutions'
    });
  } else if (video.availableResolutions.some(res => !Resolutions[res])) {
    errors.errorsMessages.push({
      message: 'One or more resolutions are invalid',
      field: 'availableResolutions'
    });
  }

  if (!video.title || typeof video.title !== 'string' || !video.title.trim() || video.title.length >= 41){
    errors.errorsMessages.push({ message: 'string', field: "title" })
  }

  if (typeof video.canBeDownloaded !== 'boolean') {
    errors.errorsMessages.push({
      message: 'CanBeDownloaded must be a boolean',
      field: 'canBeDownloaded'
    });
  }

  if (video.minAgeRestriction){
    if (video.minAgeRestriction !== null && typeof video.minAgeRestriction !== 'number' || video.minAgeRestriction > 18) {
      errors.errorsMessages.push({
        message: 'MinAgeRestriction must be a number or null',
        field: 'minAgeRestriction'
      });
    }
  }

  if (video.publicationDate && isNaN(Date.parse(video.publicationDate)) || video.publicationDate !== 'string') {
    errors.errorsMessages.push({
      message: 'PublicationDate must be a valid ISO date string',
      field: 'publicationDate'
    });
  }

  if (video.author.length >= 20){
    errors.errorsMessages.push({ message: 'string', field: "author" })
  }

  return errors

}

const inputValidation = (video: InputVideoType) => {
  const errors: OutputErrorsType = {
    errorsMessages: []
  }
  if (!Array.isArray(video.availableResolutions)) {
    console.log('1')
    errors.errorsMessages.push({
      message: 'error!!!!', field: 'availableResolutions'
    })
  }
  console.log(video)
    if (video.availableResolutions.find(p => !Resolutions[p]))  {
      console.log('2')
      errors.errorsMessages.push({
        message: 'error!!!!', field: 'availableResolutions'
      })
  }
    if (!video.title || typeof video.title !== 'string' || !video.title.trim() || video.title.length >= 41){
      errors.errorsMessages.push({ message: 'string', field: "title" })
    }

  if (video.author.length >= 20){
    errors.errorsMessages.push({ message: 'string', field: "author" })
  }
  return errors
}

const videoController = {
    getVideos: (req: Request, res: Response<any /*OutputVideoType[]*/>) => {
        const videos = db.videos // получаем видео из базы данных

        // res
        //     .status(200)
        //     .json(videos) // отдаём видео в качестве ответа

      if (videos.length){
        res
          .status(200)
          .json(videos)
      } else {
        res.sendStatus(404)
      }
    },
    createVideo: (req: Request<any, any, InputVideoType>, res: Response<any /*OutputVideoType*/ | OutputErrorsType>) => {
      // let title = req.body.title
      // if (!title || typeof title !== 'string' || !title.trim() || title.length < 41) {
      //   res
      //     .status(400)
      //     .send({ errorsMessages: [{ message: 'string', field: "title" }] })
      //   return
      // }
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
      res.sendStatus(404)
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
  updateVideo: (req: Request<any, any, OutputVideoUpdatedType>, res: Response<any>) => {
    const errors = outputValidation(req.body)
    if (errors.errorsMessages.length) { // если есть ошибки - отправляем ошибки
      res
        .status(400)
        .json(errors)
      return
      // return res.status(400).json(errors)
    }
    const video = db.videos.find(p => p.id === +req.params.id)

    if (video) {
        video.title =  req.body.title
        video.author = req.body.author
        video.availableResolutions = req.body.availableResolutions
        video.canBeDownloaded = req.body.canBeDownloaded
        video.minAgeRestriction = req.body.minAgeRestriction
        video.publicationDate = req.body.publicationDate
      res
        .status(204)
        .send(video)
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
