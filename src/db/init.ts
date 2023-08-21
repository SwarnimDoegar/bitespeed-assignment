import {Contact} from '../types/db/models'

const initDB = () => {
    Contact.sync({alter: true})
}

export default initDB;