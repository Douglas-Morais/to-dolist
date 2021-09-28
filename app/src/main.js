import ITask from "./interface/task.js";
import { API_SERVICE } from "./service/api.service.js";
import { EVENT_EMITTER } from "./service/event-emitter.js";

export class AppMain extends HTMLElement {
  #apiService;
  #formTask;
  #selectTag;
  #buttonTag;
  #eventEmitter;

  constructor() {
    super();
    this.#apiService = API_SERVICE;
    this.#eventEmitter = EVENT_EMITTER;
    console.log('App Initialized!');
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.#formTask = document.forms.namedItem('formTask');
    this.#selectTag = document.getElementById('select-tag');
    this.#buttonTag = document.getElementById('button-tag');
    this.#buttonTag.addEventListener('click', this.createTag.bind(this));
    this.inputDeadline = document.getElementById('input-deadline');
    this.inputDeadline.setAttribute('min', new Date().toISOString().split('T')[0]);
    this.inputDescription = document.getElementById('input-description');
    this.buttonSubmit = document.getElementById('submit');
    this.#formTask.addEventListener('submit', this.submitTask.bind(this));
    this.#formTask.addEventListener('input', this.validateDataInputs.bind(this));
    this.insertTagsOptionsIntoDom();
    this.insertTasksIntoDom();
    this.#eventEmitter.on('createdTag', this.insertTagOptionIntoDom.bind(this));
  }

  createTag(ev) {
    const appModal = document.createElement('app-modal');
    document.body.appendChild(appModal);
  }

  insertTagsOptionsIntoDom() {
    this.#apiService.getTags()
      .then((tags) => {
        tags.forEach((tag, index) => {
          this.insertTagOptionIntoDom(tag);
        });
      })
      .catch((err) => console.error(err));
  }

  insertTagOptionIntoDom(tag) {
    const optionTag = document.createElement('option');
    optionTag.setAttribute('value', tag.id);
    optionTag.innerText = tag.description;
    this.#selectTag.appendChild(optionTag);
  }

  validateDataInputs(ev) {
    if (ev.target.name === 'description') {
      if (ev.target.checkValidity()) {
        ev.target.parentNode.classList = 'form-control success';
      } else {
        ev.target.parentNode.classList = 'form-control error';
        //ev.target.parentNode.querySelector('small').innerHTML = 'Mínimo 3 caracteres e no máximo 40';
      }
    }
    if (ev.target.name === 'deadline') {
      if (ev.target.checkValidity()) {
        ev.target.parentNode.classList = 'form-control success';
      } else {
        ev.target.parentNode.classList = 'form-control error';
        //ev.target.parentNode.querySelector('small').innerHTML = 'Mínimo hoje';
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
      new Date(formProps.deadline),
      formProps.priorityKey,
      formProps.tagKey
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
    deadline.innerHTML = dataTask.deadline.toLocaleDateString();

    const priority = document.createElement('span');
    priority.setAttribute('slot', 'priorityKey');
    this.#apiService.getPriorityDescriptionByKey(dataTask.priorityKey)
      .then((priorityDescription) => {
        priority.innerText = priorityDescription;
        taskElement.appendChild(priority);
      });

    const tag = document.createElement('span');
    tag.setAttribute('slot', 'tagKey');
    this.#apiService.getTagDescriptionByKey(dataTask.tagKey)
      .then((tagDescription) => {
        tag.innerText = tagDescription;
        taskElement.appendChild(tag);
      });

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

  insertTasksIntoDom() {
    this.#apiService.getTasks()
      .then((serverTasks) => {
        const createTaskElement = (data, index) => {
          const task = document.createElement('app-task');

          task.setAttribute('data-object', JSON.stringify(data));

          const deadline = document.createElement('span');
          deadline.setAttribute('slot', 'deadline');

          deadline.innerHTML = new Date(data.deadline).toLocaleDateString();

          const description = document.createElement('span');
          description.setAttribute('slot', 'description');
          description.innerHTML = data.description;

          const priority = document.createElement('span');
          priority.setAttribute('slot', 'priorityKey');
          this.#apiService.getPriorityDescriptionByKey(data.priorityKey)
            .then((priorityDescription) => {
              priority.innerHTML = priorityDescription;
              task.appendChild(priority);
            });

          const tag = document.createElement('span');
          tag.setAttribute('slot', 'tagKey');
          this.#apiService.getTagDescriptionByKey(data.tagKey)
            .then((tagDescription) => {
              tag.innerText = tagDescription;
              task.appendChild(tag);
            });

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
