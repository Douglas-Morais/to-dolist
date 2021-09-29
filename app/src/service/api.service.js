import { EVENT_EMITTER } from "./event-emitter.js";
import { DB_INDEXEDDB } from "../storage/indexedDb.js";
import { DB_MEMORY } from "../storage/memoryDb.js";

class ApiService {
  updateEventDbName = 'updateEventDb';
  createEventDbName = 'createEventDb';
  eventEmitter;
  #dbService;

  constructor() {
    this.eventEmitter = EVENT_EMITTER;
    this.#dbService = window.indexedDB ? DB_INDEXEDDB : DB_MEMORY;
    this.showMessageStoreDataStatus();
  }

  showMessageStoreDataStatus() {
    setTimeout(() => {
      if (window.localStorage.getItem('storageMessage') === 'true') return
      if (window.indexedDB) {
        alert('Suas tarefas serão gravadas automaticamente para quando retornar!\n');
      } else {
        alert(`Atualize seu browser!
        Browser imcompatível para gravação das tarefas.
        Ao recarregar a página os dados serão perdidos!
        `);
      }
      window.localStorage.setItem('storageMessage', true);
    }, 1000);
  }

  getTasks() {
    return this.#dbService.getAllTasks();
  }

  getPriorityDescriptionByKey(key) {
    return this.#dbService.getPriorityDescription(key);
  }

  getTags() {
    return this.#dbService.getAllTags();
  }

  getTagDescriptionByKey(key) {
    return this.#dbService.getTagDescription(key);
  }

  createTask(task) {
    return this.#dbService.insertTask(task);
  }

  createTag(tag) {
    return this.#dbService.insertTag(tag);
  }

  checkTask(task) {
    return this.#dbService.checkTask(task);
  }

  updateTask(task) {
    return this.#dbService.updateTask(task);
  }

  deleteTask(task) {
    return this.#dbService.deleteTask(task);
  }
}

export const API_SERVICE = new ApiService();