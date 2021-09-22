import { EventEmitter } from "./event-emitter.js";
import { DATAS_FAKE } from "./datafake.const.js";

export class ApiService {
  eventEmitter;
  updateEventDb = 'updateEventDb';
  createEventDb = 'createEventDb';

  constructor() {
    this.dataTasks = DATAS_FAKE;
    this.eventEmitter = new EventEmitter();
  }

  handleDbEvent() {
    console.log('disparei!')
  }

  createTask(task) {
    return new Promise((resolve, reject) => {
      this.dataTasks.push(task);
      if (this.dataTasks.indexOf(task) !== -1) {
        task.id = this.dataTasks.indexOf(task);
        this.eventEmitter.emit(this.createEventDb, task);
        resolve();
      } else {
        reject(new Error('Writing in DB unsuccessful!'));
      }
    });
  }

  readTasks() {
    return new Promise((resolve, reject) => {
      if (this.dataTasks) {
        resolve(this.dataTasks);
      }
      reject(new Error('Data Empty!'));
    });
  }

  updateTask(task) {
    return new Promise((resolve, reject) => {
      try {
        this.dataTasks[task.id] = task;
        resolve();
      } catch (err) {
        reject(err)
      }

    });
  }

  deleteTask(task) {
    return new Promise((resolve, reject) => {
      try {
        this.dataTasks.splice(this.dataTasks.indexOf(task), 1);
        resolve(this.dataTasks);
      } catch (err) {
        reject(err)
      }

    });
  }
}
