import ITask from "../interface/task.js";

class IndexedDB {
  #DB_NAME = 'to-Do-immersion42';
  #DB_STORE_NAME = 'tasks';
  #DB_VERSION = 1;

  constructor() { }

  async openDb() {
    return await new Promise((res, rej) => {
      const req = window.indexedDB.open(this.#DB_NAME, this.#DB_VERSION);
      req.onsuccess = (ev) => {
        const dbConnection = req.result;
        res(dbConnection);
      };

      req.onerror = function (ev) {
        rej('openDb:', ev.target.errorCode);
      };

      req.onupgradeneeded = function (ev) {
        const store = ev.currentTarget.result;

        let objectStore = store.createObjectStore('tasks', { autoIncrement: true });
        objectStore.createIndex("description", "description", { unique: true });
        objectStore.createIndex("created", "created", { unique: false });
        objectStore.createIndex("deadline", "deadline", { unique: false });
      };
    });
  }

  async readAllTasks() {
    return await new Promise((res, rej) => {
      this.openDb()
        .then((dbConnection) => {
          const transaction = dbConnection.transaction(this.#DB_STORE_NAME, 'readwrite');
          transaction.oncomplete = (ev) => {
            res();
          };
          transaction.onerror = (ev) => {
            rej(ev.target.error)
          };

          const objectStore = transaction.objectStore(this.#DB_STORE_NAME);
          const request = objectStore.getAll();
          request.onsuccess = (ev) => {
            let tasks = ev.target.result;
            const requestKeys = objectStore.getAllKeys();
            requestKeys.onsuccess = (ev) => {
              tasks.forEach((task, index) => task.id = ev.target.result[index]);
              res(tasks);
            };
          };
        })
        .catch((err) => console.error(err));
    });
  }

  async insertTask(task) {
    return await new Promise((res, rej) => {
      if (!task instanceof ITask) { rej(new TypeError('Data is not of type ITask')) };

      this.openDb()
        .then((dbConnection) => {
          const transaction = dbConnection.transaction(this.#DB_STORE_NAME, 'readwrite');
          transaction.oncomplete = (ev) => {
            res(task);
          };
          transaction.onerror = (ev) => {
            rej(ev.target.error)
          };

          const objectStore = transaction.objectStore(this.#DB_STORE_NAME);
          const request = objectStore.add({
            description: task.description,
            created: task.created,
            deadline: task.deadline,
            isComplete: task.isComplete,
          });
          request.onsuccess = (ev) => {
            task.id = ev.target.result
          };
        })
        .catch((err) => console.error(err));
    });
  }

  async updateTask(task) {
    return await new Promise((res, rej) => {
      if (!task instanceof ITask) { rej(new TypeError('Data is not of type ITask')) };

      this.openDb()
        .then((dbConnection) => {
          const transaction = dbConnection.transaction(this.#DB_STORE_NAME, 'readwrite');
          transaction.oncomplete = (ev) => {
            res(task);
          };
          transaction.onerror = (ev) => {
            rej(ev.target.error)
          };

          const objectStore = transaction.objectStore(this.#DB_STORE_NAME);
          const request = objectStore.get(task.id);
          request.onsuccess = (ev) => {
            let data = ev.target.result;
            data.description = task.description ? task.description : data.description;
            data.created = task.created ? task.created : data.created;
            data.deadline = task.deadline ? task.deadline : data.deadline;
            data.isComplete = task.isComplete ? task.isComplete : data.isComplete;
            objectStore.put(data, task.id);
          };
        })
        .catch((err) => console.error(err));
    });
  }

  async deleteTask(task) {
    return await new Promise((res, rej) => {
      if (!task instanceof ITask) { rej(new TypeError('Data is not of type ITask')) };

      this.openDb()
        .then((dbConnection) => {
          const transaction = dbConnection.transaction(this.#DB_STORE_NAME, 'readwrite');
          transaction.oncomplete = (ev) => {
            res(task);
          };
          transaction.onerror = (ev) => {
            rej(ev.target.error)
          };

          const objectStore = transaction.objectStore(this.#DB_STORE_NAME);
          const request = objectStore.delete(task.id);
          request.onsuccess = (ev) => {
            console.warn(ev);
          };
        })
        .catch((err) => console.error(err));
    });
  }

}

export const DB_INDEXEDDB = new IndexedDB();
