import {Request, Response, Router} from 'express'
import {db} from "../db/db";
import {InputVideoType, Resolutions} from "../input-output-types/video-types";
import {OutputErrorsType} from "../input-output-types/output-errors-type";
// import {findVideoController} from './findVideoController'
// import {deleteVideoController} from './deleteVideoController'

export const videosRouter = Router()

const inputValidation = (video: InputVideoType) => {
  const errors: OutputErrorsType = { // объект для сбора ошибок
    errorsMessages: []
  }
// ...
  if (!Array.isArray(video.availableResolution)
    || video.availableResolution.find(p => !Resolutions[p])
  ) {
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

      // если всё ок - добавляем видео
      const newVideo: any /*VideoDBType*/ = {
        ...req.body,
        id: (new Date().toISOString()),
        title: req.body.title,
        author: 'me',
        // ...
      }
      db.videos = [...db.videos, newVideo]

      res
        .status(201)
        .send(newVideo)
    },
  findVideo: (req: Request, res: Response<any>) => {
      const foundVideo = db.videos.find(p => p.id === +req.params.id)

    if (!foundVideo) {
      res.status(404)
      return
    }

    res.json(foundVideo)
  },
  deleteVideo: (req: Request, res: Response<any>) => {
    db.videos = db.videos.filter(p => p.id !== +req.params.id)

    res.status(204)
  },
  updateVideo: (req: Request, res: Response<any>) => {
      let title = req.body.title
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).send({
        errorsMessages: [{
          "message": "title is required",
          "field": "title",
        }]
      })
    }
      const id = +req.params.id
    const video = db.videos.find(p => p.id === id)

    if (video) {
      video.title = title
      res.status(204)
    } else {
      res.status(404)
    }
  }
}

videosRouter.get('/', videoController.getVideos)
videosRouter.post('/', videoController.createVideo)
videosRouter.get('/:id', videoController.findVideo)
videosRouter.delete('/:id', videoController.deleteVideo)
videosRouter.put('/:id', videoController.updateVideo)
// ...

// не забудьте добавить роут в апп