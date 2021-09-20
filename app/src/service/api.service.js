import { DATAS_FAKE } from "./datafake.const.js";

export class ApiService {
  dataTasks;

  constructor(){
    this.dataTasks = DATAS_FAKE;
    console.log('API Service Initialized!');
  }

  createTask(task) {
    this.dataTasks.push(task);
    console.log(this.dataTasks)
  }

  readTasks() {
    return this.dataTasks;
  }

  updateTask(task) {
    index = this.dataTasks.findIndex((itemTask) => itemTask.id === task.id);
    console.warn('API Update!', index);
  }

  deleteTask(taskId) {
    index = this.dataTasks.findIndex((itemTask) => itemTask.id === taskId);
    console.warn('API Delete!', index);
  }
}
