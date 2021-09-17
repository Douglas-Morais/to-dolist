import { DATAS_FAKE } from "./service/datafake.const.js";

export class AppMain extends HTMLElement {
  dataFake = DATAS_FAKE;

  constructor() {
    super();
    console.log('App Initialized!');
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    
    const listTask = this.createTasks(this.dataFake);
    listTask.forEach( task => shadow.appendChild(task));
  }

  createTasks(arrayTasks) {
    const dataTasks = [...arrayTasks];
    const createTask = (_, id) => {
      const task = document.createElement('app-task');

      return task;
    }

    return Array.from(dataTasks, createTask);
  }

}

customElements.define('app-main', AppMain);
