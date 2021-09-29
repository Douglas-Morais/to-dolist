import ITag from "../interface/tag.js";
import ITask from "../interface/task.js";

class MemoryDb {
  #tasksInMemory = [
    {
      id: 1,
      description: 'Tarefa em Memória!',
      created: new Date(),
      deadline: new Date(),
      isComplete: false,
      priorityKey: 1,
      tagKey: 1,
    }
  ];

  #tagsInMemory = [
    {
      id: 1,
      description: 'Casa',
    },
    {
      id: 2,
      description: 'Faculdade',
    },
    {
      id: 5,
      description: 'Trabalho',
    }
  ];

  constructor() { }

  async getAllTasks() {
    return await new Promise((resolve, reject) => {
      resolve(this.#tasksInMemory);
    });
  }

  async getPriorityDescription(key) {
    return await new Promise((res, rej) => {
      switch (Number(key)) {
        case 1:
          res('Urgente');
          break;
        case 2:
          res('Importante');
          break;
        case 3:
          res('Normal');
          break;
        case 4:
          res('Adiável');
          break;

        default:
          res('Normal');
          break;
      }
    });
  }

  async getTagDescription(key) {
    return await new Promise((res, rej) => {
      const index = this.#tagsInMemory.findIndex((tag) => {
        if (tag.id == key) return true
        return false
      });
      res(this.#tagsInMemory[index].description);
    });
  }

  async getAllTags() {
    return await new Promise((resolve, reject) => {
      resolve(this.#tagsInMemory);
    });
  }

  async insertTask(task) {
    if (!task instanceof ITask) { rej(new TypeError('Data is not of type ITask')) };
    return new Promise((resolve, reject) => {
      this.#tasksInMemory.push(task);
      if (this.#tasksInMemory.indexOf(task) !== -1) {
        task.id = this.#tasksInMemory.indexOf(task);
        resolve(task);
      } else {
        reject(new Error('Writing in memory error!'));
      }
    });
  }

  async insertTag(tag) {
    if (!tag instanceof ITag) { rej(new TypeError('Data is not of type ITask')) };
    return new Promise((resolve, reject) => {
      this.#tagsInMemory.push(tag);
      if (this.#tagsInMemory.indexOf(tag) !== -1) {
        tag.id = this.#tagsInMemory.indexOf(tag);
        resolve(tag);
      } else {
        reject(new Error('Writing in memory error!'));
      }
    });
  }

  async checkTask(task) {
    if (!task instanceof ITask) { rej(new TypeError('Data is not of type ITask')) };
    return new Promise((resolve, reject) => {
      const index = this.#tasksInMemory.findIndex((taskMemory) => {
        if (taskMemory.id === task.id) return true;
        return false;
      });
      try {
        this.#tasksInMemory[index].isComplete = true;
        resolve(this.#tasksInMemory[index]);
      } catch (err) {
        console.error(err);
        reject(new Error('Update data in memory error!'));
      }
    });
  }

  async updateTask(task) {
    if (!task instanceof ITask) { rej(new TypeError('Data is not of type ITask')) };
    return new Promise((resolve, reject) => {
      try {
        this.#tasksInMemory[task.id] = task;
        resolve(this.#tasksInMemory[task.id]);
      } catch (err) {
        reject(new Error('Update data in memory error!'));
      }
    });
  }

  async deleteTask(task) {
    if (!task instanceof ITask) { rej(new TypeError('Data is not of type ITask')) };
    return new Promise((resolve, reject) => {
      try {
        this.#tasksInMemory.splice(this.#tasksInMemory.indexOf(task), 1);
        resolve(this.#tasksInMemory);
      } catch (err) {
        reject(err)
      }

    });
  }
}

export const DB_MEMORY = new MemoryDb();
