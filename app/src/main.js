import Task from "./interface/task.js";
import { ApiService } from "./service/api.service.js";

export class AppMain extends HTMLElement {
  apiService;
  formTask;
  listTask;

  constructor() {
    super();
    this.apiService = new ApiService();
    this.apiService.eventEmitter.on(this.apiService.createEventDb, (taskData) => {
      this.createTask(taskData);
    });
    console.log('App Initialized!');
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.listTask = document.getElementById('list-tasks');
    this.formTask = document.forms.namedItem('formTask');
    this.formTask.addEventListener('submit', this.submitTask.bind(this));
    this.updateTasksIntoDom();
  }

  submitTask(ev) {
    ev.preventDefault();
    const formData = new FormData(ev.target);
    let formProps = Object.fromEntries(formData);

    const dataTask = new Task(
      undefined,
      formProps.description.trim(),
      new Date(),
      formProps.deadline
    );

    this.formTask.reset();
    this.apiService.createTask(dataTask);
  }

  createTask(dataTask) {
    const task = document.createElement('app-task');

    task.setAttribute('id', dataTask.id);
    task.setAttribute('description', dataTask.description);

    const deadline = document.createElement('span');
    deadline.setAttribute('slot', 'deadline');
    deadline.innerHTML = dataTask.deadline;

    const description = document.createElement('span');
    description.setAttribute('slot', 'description')
    description.innerHTML = dataTask.description;

    if (dataTask.isComplete) {
      task.setAttribute('done', '');
      deadline.innerHTML = "Concluído!";
    }

    task.appendChild(description);
    task.appendChild(deadline);
    
    task.style.visibility = 'hidden';

    const mutationObserve = new MutationObserver((mutationList, observe) => {
      task.shadowRoot.getElementById('task').classList.add('fade');
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          setTimeout(() => {
            task.style.visibility = 'visible';
            task.shadowRoot.getElementById('task').classList.add('fade-in');
            mutationObserve.disconnect();
          }, 400);
        }
      }
    });
    mutationObserve.observe(
      this.shadowRoot,
      { childList: true, subtree: true, attributes: true }
    );

    this.shadowRoot.appendChild(task);
  }


  updateTasksIntoDom() {
    this.apiService.readTasks()
      .then((serverTasks) => {
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

        Array.from(serverTasks, createTask).forEach((task) => this.shadowRoot.appendChild(task));
      })
      .catch((err) => console.error(err));
  }
}

customElements.define('app-main', AppMain);
