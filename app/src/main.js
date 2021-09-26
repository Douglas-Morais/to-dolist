import ITask from "./interface/task.js";
import { API_SERVICE } from "./service/api.service.js";

export class AppMain extends HTMLElement {
  #apiService;
  #formTask;

  constructor() {
    super();
    this.#apiService = API_SERVICE;
    console.log('App Initialized!');
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.#formTask = document.forms.namedItem('formTask');
    this.inputDeadline = document.getElementById('input-deadline');
    this.inputDeadline.setAttribute('min', new Date().toISOString().split('T')[0]);
    this.inputDescription = document.getElementById('input-description');
    this.buttonSubmit = document.getElementById('submit');
    this.#formTask.addEventListener('submit', this.submitTask.bind(this));
    this.#formTask.addEventListener('input', this.validateDataInputs.bind(this));
    this.updateTasksIntoDom();
  }

  validateDataInputs(ev) {
    if(ev.target.name === 'description') {
      if(ev.target.checkValidity()){
        ev.target.parentNode.classList = 'form-control success';
      }else {
        ev.target.parentNode.classList = 'form-control error';
        ev.target.parentNode.querySelector('small').innerHTML = 'Mínimo 3 caracteres e no máximo 40';
      }
    }
    if(ev.target.name === 'deadline') {
      if(ev.target.checkValidity()){
        ev.target.parentNode.classList = 'form-control success';
      }else {
        ev.target.parentNode.classList = 'form-control error';
        ev.target.parentNode.querySelector('small').innerHTML = 'A fim do prazo deverá ser no mínimo a data de hoje';
      }
    }

    if (this.#formTask.checkValidity()) {
      this.buttonSubmit.removeAttribute('disabled');
    } else {
      this.buttonSubmit.setAttribute('disabled', '');
    }
  }

  submitTask(ev) {
    ev.preventDefault();
    const formData = new FormData(ev.target);
    let formProps = Object.fromEntries(formData);

    const dataTask = new ITask(
      undefined,
      formProps.description.trim(),
      new Date(),
      new Date(formProps.deadline)
    );

    this.buttonSubmit.setAttribute('disabled', '');
    this.#formTask.reset();
    this.inputDescription.parentNode.classList = 'form-control';
    this.inputDeadline.parentNode.classList = 'form-control';
    
    this.#apiService.createTask(dataTask)
      .then((task) => {
        this.createTaskIntoDom(task);
      })
      .catch((err) => {
        alert('Houve um erro ao gravar os dados no banco de dados!');
      });
  }

  createTaskIntoDom(dataTask) {
    const taskElement = document.createElement('app-task');

    taskElement.setAttribute('data-object', JSON.stringify(dataTask));

    const deadline = document.createElement('span');
    deadline.setAttribute('slot', 'deadline');
    deadline.innerHTML = dataTask.deadline.toLocaleDateString()

    if (dataTask.isComplete) {
      taskElement.setAttribute('done', '');
      deadline.innerHTML = "Concluído!";
    }

    taskElement.appendChild(deadline);
    taskElement.style.visibility = 'hidden';

    const mutationObserve = new MutationObserver((mutationList, observe) => {
      taskElement.shadowRoot.getElementById('task').classList.add('fade');
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          setTimeout(() => {
            taskElement.style.visibility = 'visible';
            taskElement.shadowRoot.getElementById('task').classList.add('fade-in');
            mutationObserve.disconnect();
          }, 400);
        }
      }
    });
    mutationObserve.observe(
      this.shadowRoot,
      { childList: true, subtree: true, attributes: true }
    );

    this.shadowRoot.appendChild(taskElement);
  }


  updateTasksIntoDom() {
    this.#apiService.readTasks()
      .then((serverTasks) => {
        const createTaskElement = (data, index) => {
          const task = document.createElement('app-task');

          task.setAttribute('data-object', JSON.stringify(data));

          const deadline = document.createElement('span');
          deadline.setAttribute('slot', 'deadline');

          deadline.innerHTML = `Concluir até ${new Date(data.deadline).toLocaleDateString()}`;

          const description = document.createElement('span');
          description.setAttribute('slot', 'description');
          description.innerHTML = data.description;

          if (data.isComplete) {
            task.setAttribute('done', '');
            deadline.innerHTML = "Concluído!";
          }

          task.appendChild(description);
          task.appendChild(deadline);
          return task;
        }
        Array.from(serverTasks, createTaskElement).forEach((task) => this.shadowRoot.appendChild(task));
      })
      .catch((err) => console.error(err));
  }
}


customElements.define('app-main', AppMain);
