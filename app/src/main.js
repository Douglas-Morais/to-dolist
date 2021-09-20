import Task from "./interface/task.js";
import { ApiService } from "./service/api.service.js";

export class AppMain extends HTMLElement {
  apiService;
  formTask;

  constructor() {
    super();
    this.apiService = new ApiService();
    console.log('App Initialized!');
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });

    const serverTasks = this.apiService.readTasks();
    const listTask = this.showTasks(serverTasks);
    listTask.forEach(task => shadow.appendChild(task));

    this.formTask = document.forms.namedItem('formTask');
    this.formTask.addEventListener('submit', this.submitTask.bind(this));
  }

  submitTask(ev) {
    ev.preventDefault();
    const formData = new FormData(ev.target);
    let formProps = Object.fromEntries(formData);
    
    const task = new Task(
      undefined,
      formProps.description.trim(),
      new Date(),
      formProps.deadline
    );

    this.apiService.createTask(task);
  }

  showTasks(arrayTasks) {
    const dataTasks = [...arrayTasks];
    const createTask = (data, index) => {
      const task = document.createElement('app-task');

      task.setAttribute('id', data.id);
      task.setAttribute('description', data.description);

      const deadline = document.createElement('span');
      deadline.setAttribute('slot', 'deadline')
      deadline.innerHTML = data.deadline;

      const description = document.createElement('span');
      description.setAttribute('slot', 'description')
      description.innerHTML = data.description;

      if (data.isComplete) {
        task.setAttribute('done', '');
        deadline.innerHTML = "Concluído!";
      }

      task.appendChild(description);
      task.appendChild(deadline);
      return task;
    }

    return Array.from(dataTasks, createTask);
  }

}

customElements.define('app-main', AppMain);
