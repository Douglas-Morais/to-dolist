import ITask from '../interface/task.js';

class IndexedDB {
  #DB_NAME = 'to-Do-immersion42';
  #DB_STORE_TASK = 'tasks';
  #DB_STORE_TAGS = 'tags';
  #DB_STORE_PRIORITIES = 'priorities';
  #DB_VERSION = 1;

  constructor() { }

  async openDb() {
    return await new Promise((res, rej) => {
      const req = window.indexedDB.open(this.#DB_NAME, this.#DB_VERSION);
      req.onsuccess = (ev) => {
        const dbConnection = req.result;
        res(dbConnection);
      };

      req.onerror = (ev) => {
        rej('openDb:', ev.target.errorCode);
      };

      req.onupgradeneeded = (ev) => {
        const store = ev.currentTarget.result;

        const taskStore = store.createObjectStore(this.#DB_STORE_TASK, { autoIncrement: true });
        taskStore.createIndex('description', 'description', { unique: true });
        taskStore.createIndex('created', 'created', { unique: false });
        taskStore.createIndex('deadline', 'deadline', { unique: false });
        taskStore.createIndex('priorityKey', 'priorityKey', { unique: false });

        const tagStore = store.createObjectStore(this.#DB_STORE_TAGS, { autoIncrement: true });
        tagStore.createIndex('description', 'description', { unique: true });

        const priorityStore = store.createObjectStore(this.#DB_STORE_PRIORITIES, { autoIncrement: true });
        priorityStore.createIndex('description', 'description', { unique: true });

        priorityStore.add({ description: 'Urgente' });
        priorityStore.add({ description: 'Importante' });
        priorityStore.add({ description: 'Normal' });
        priorityStore.add({ description: 'Adiável' });
      };
    });
  }

  async readAllTasks() {
    return await new Promise((res, rej) => {
      this.openDb()
        .then((dbConnection) => {
          const transaction = dbConnection.transaction(this.#DB_STORE_TASK, 'readonly');
          transaction.oncomplete = (ev) => {
            res();
          };
          transaction.onerror = (ev) => {
            rej(ev.target.error)
          };

          const objectStore = transaction.objectStore(this.#DB_STORE_TASK);
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

  async getPriorityDescription(key) {
    return await new Promise((res, rej) => {
      this.openDb()
        .then((dbConnection) => {
          const transaction = dbConnection.transaction(this.#DB_STORE_PRIORITIES, 'readonly');
          transaction.oncomplete = (ev) => {
            res();
          };
          transaction.onerror = (ev) => {
            rej(ev.target.error)
          };

          const objectStore = transaction.objectStore(this.#DB_STORE_PRIORITIES);
          objectStore.openCursor().onsuccess = (ev) => {
            let cursor = ev.target.result;
            if(cursor) {
              cursor.key == key
              ? res(cursor.value.description)
              : cursor.continue();
            }
          }
        })
        .catch((err) => console.error(err));
    });
    
  }

  async insertTask(task) {
    return await new Promise((res, rej) => {
      if (!task instanceof ITask) { rej(new TypeError('Data is not of type ITask')) };

      this.openDb()
        .then((dbConnection) => {
          const transaction = dbConnection.transaction(this.#DB_STORE_TASK, 'readwrite');
          transaction.oncomplete = (ev) => {
            res(task);
          };
          transaction.onerror = (ev) => {
            rej(ev.target.error)
          };

          const objectStore = transaction.objectStore(this.#DB_STORE_TASK);
          const request = objectStore.add({
            description: task.description,
            created: task.created,
            deadline: task.deadline,
            isComplete: task.isComplete,
            priorityKey: task.priorityKey,
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
          const transaction = dbConnection.transaction(this.#DB_STORE_TASK, 'readwrite');
          transaction.oncomplete = (ev) => {
            res(task);
          };
          transaction.onerror = (ev) => {
            rej(ev.target.error)
          };

          const objectStore = transaction.objectStore(this.#DB_STORE_TASK);
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
          const transaction = dbConnection.transaction(this.#DB_STORE_TASK, 'readwrite');
          transaction.oncomplete = (ev) => {
            res(task);
          };
          transaction.onerror = (ev) => {
            rej(ev.target.error)
          };

          const objectStore = transaction.objectStore(this.#DB_STORE_TASK);
          objectStore.delete(task.id);
        })
        .catch((err) => console.error(err));
    });
  }

}

export const DB_INDEXEDDB = new IndexedDB();
