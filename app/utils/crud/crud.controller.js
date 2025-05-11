import * as crud from "./crud.factory.js";

class Crud {
  constructor(className) {
    this.className = className;
  }

  create = () => crud.createOne(this.className);
  update = () => crud.updateOne(this.className);
  delete = () => crud.deleteOne(this.className);
  getOne = () => crud.getOne(this.className);
  getAll = () => crud.getAll(this.className);
}

export default Crud;

