import ITask from "../interface/task.js";

class MemoryDb {
  #datasInMemory = [
    {
      id: 1,
      description: 'Tarefa em Memória!',
      created: new Date(),
      deadline: new Date(),
      isComplete: false,
    }
  ];

  constructor() { }

  async readAllTasks() {
    return await new Promise((resolve, reject) => {
      resolve(this.#datasInMemory);
    });
  }

  async insertTask(task) {
    if (!task instanceof ITask) { rej(new TypeError('Data is not of type ITask')) };
    return new Promise((resolve, reject) => {
      this.#datasInMemory.push(task);
      if (this.#datasInMemory.indexOf(task) !== -1) {
        task.id = this.#datasInMemory.indexOf(task);
        resolve(task);
      } else {
        reject(new Error('Writing in memory error!'));
      }
    });
  }

  async updateTask(task) {
    if (!task instanceof ITask) { rej(new TypeError('Data is not of type ITask')) };
    return new Promise((resolve, reject) => {
      try {
        this.#datasInMemory[task.id] = task;
        resolve(this.#datasInMemory[task.id]);
      } catch (err) {
        reject(new Error('Update data in memory error!'));
      }
    });
  }

  async deleteTask(task) {
    if (!task instanceof ITask) { rej(new TypeError('Data is not of type ITask')) };
    return new Promise((resolve, reject) => {
      try {
        this.#datasInMemory.splice(this.#datasInMemory.indexOf(task), 1);
        resolve(this.#datasInMemory);
      } catch (err) {
        reject(err)
      }

    });
  }
}

export const DB_MEMORY = new MemoryDb();
