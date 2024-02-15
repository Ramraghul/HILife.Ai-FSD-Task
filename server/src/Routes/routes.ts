import express from "express";
const route = express.Router();
import mainController from "../Controllers/controller";
import upload from "../middleware/multerMiddleware";

// Create New ToDo
route.post('/create', upload.array('files', 5), mainController.createNewToDo);

//GetList
route.get('/getList', mainController.getList);

//getById;
route.get('/getById', mainController.findById);

//delete Api
route.post('/delete', mainController.delete);

export default route;
