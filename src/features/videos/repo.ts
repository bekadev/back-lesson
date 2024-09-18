import {db} from "../../db/db";
import {InputVideoType, OutputVideoType, OutputVideoUpdatedType} from "../../input-output-types/video-types";
import dateFns from "date-fns";

export const videosRepo  = {
  getAllVideos(){
    return db.videos
  },
  createdNewVideo(body: InputVideoType) {
    const createdAt = new Date().toISOString()
    const newVideo: OutputVideoType /*VideoDBType*/ = {
      id: Date.now(),
      title: body.title,
      author: body.author,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt,
      publicationDate: dateFns.addDays(createdAt, 1).toISOString(),
      availableResolutions: body.availableResolutions,
    }
    return db.videos = [...db.videos, newVideo]
  },
  findVideo(id: number){
    return db.videos.find(p => p.id === id)
  },
  updateVideo(id: number, body: OutputVideoUpdatedType) {
    const video = db.videos.find(p => p.id === id)

    if (video) {
      video.title =  body.title
      video.author = body.author
      video.availableResolutions = body.availableResolutions
      video.canBeDownloaded = body.canBeDownloaded
      video.minAgeRestriction = body.minAgeRestriction
      video.publicationDate = body.publicationDate

      return video
    }
  },
  deleteVideo(id: number){
    for (let i = 0; i < db.videos.length; i++) {
      if (db.videos[i].id === +id) {
        db.videos.splice(i, 1)
        return true
      }
    }
    return  false
  }
}