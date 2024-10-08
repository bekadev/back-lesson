import {app} from './app'
import {SETTINGS} from './settings'
import {connectToDB} from "./db/mongo-db";



const startApp = async () => {
	await  connectToDB()
	app.listen(SETTINGS.PORT, () => {
		console.log('...server started in port ' + SETTINGS.PORT)
	})
}

startApp()