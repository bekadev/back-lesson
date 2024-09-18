import {Router} from 'express'
// import {setDB} from '../../../Downloads/back-lesson-02-master/src/db/db'

export const testingRouter = Router()

testingRouter.delete('/all-data', (req, res) => {
    // setDB()
    res.status(204).json({})
})