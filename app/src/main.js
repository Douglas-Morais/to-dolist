import ITask from "./interface/task.js";
import { API_SERVICE } from "./service/api.service.js";
import { EVENT_EMITTER } from "./service/event-emitter.js";

export class AppMain extends HTMLElement {
  #apiService;
  #formTask;
  #selectTag;
  #buttonTag;
  #eventEmitter;
  #filterTagElement;
  #filterPriorityElement;
  #filterTagKey;
  #filterPriorityKey;

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
    this.#filterTagElement = document.getElementById('filterTag');
    this.#filterTagElement.addEventListener('change', this.filterTasks.bind(this));
    this.#filterPriorityElement = document.getElementById('filterPriority');
    this.#filterPriorityElement.addEventListener('change', this.filterTasks.bind(this));
  }

  createTag(ev) {
    const appModal = document.createElement('app-modal-tag');
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
        //ev.target.parentNode.querySelector('small').innerHTML = 'M??nimo 3 caracteres e no m??ximo 40';
      }
    }
    if (ev.target.name === 'deadline') {
      if (ev.target.checkValidity()) {
        ev.target.parentNode.classList = 'form-control success';
      } else {
        ev.target.parentNode.classList = 'form-control error';
        //ev.target.parentNode.querySelector('small').innerHTML = 'M??nimo hoje';
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
        this.insertTaskIntoDom(task);
      })
      .catch((err) => {
        alert('Houve um erro ao gravar os dados no banco de dados!');
      });
  }

  insertTaskIntoDom(dataTask) {
    const taskElement = document.createElement('app-task');

    taskElement.setAttribute('data-object', JSON.stringify(dataTask));


    const deadline = document.createElement('span');
    deadline.setAttribute('slot', 'deadline');
    deadline.setAttribute('name', 'deadline');

    deadline.innerHTML = new Date(dataTask.deadline).toLocaleDateString();

    const description = document.createElement('span');
    description.setAttribute('slot', 'description');
    description.setAttribute('name', 'description');
    description.innerHTML = dataTask.description;

    const priority = document.createElement('span');
    priority.setAttribute('slot', 'priorityKey');
    priority.setAttribute('name', 'priorityKey');
    this.#apiService.getPriorityDescriptionByKey(dataTask.priorityKey)
      .then((priorityDescription) => {
        priority.innerHTML = priorityDescription;
        taskElement.appendChild(priority);
      });

    const tag = document.createElement('span');
    tag.setAttribute('slot', 'tagKey');
    tag.setAttribute('name', 'tagKey');
    this.#apiService.getTagDescriptionByKey(dataTask.tagKey)
      .then((tagDescription) => {
        tag.innerText = tagDescription;
        taskElement.appendChild(tag);
      });

    if (dataTask.isComplete) {
      taskElement.setAttribute('done', '');
      deadline.innerHTML = "Conclu??do!";
    }

    taskElement.appendChild(deadline);
    taskElement.style.visibility = 'hidden';

    const mutationObserve = new MutationObserver((mutationList, observe) => {
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
          deadline.setAttribute('name', 'deadline');

          deadline.innerHTML = new Date(data.deadline).toLocaleDateString();

          const description = document.createElement('span');
          description.setAttribute('slot', 'description');
          description.setAttribute('name', 'description');
          description.innerHTML = data.description;

          const priority = document.createElement('span');
          priority.setAttribute('slot', 'priorityKey');
          priority.setAttribute('name', 'priorityKey');
          this.#apiService.getPriorityDescriptionByKey(data.priorityKey)
            .then((priorityDescription) => {
              priority.innerHTML = priorityDescription;
              task.appendChild(priority);
            });

          const tag = document.createElement('span');
          tag.setAttribute('slot', 'tagKey');
          tag.setAttribute('name', 'tagKey');
          this.#apiService.getTagDescriptionByKey(data.tagKey)
            .then((tagDescription) => {
              tag.innerText = tagDescription;
              task.appendChild(tag);
            });

          if (data.isComplete) {
            task.setAttribute('done', '');
            deadline.innerHTML = "Conclu??do!";
          }

          task.appendChild(description);
          task.appendChild(deadline);
          return task;
        }
        Array.from(serverTasks, createTaskElement).forEach((task) => this.shadowRoot.appendChild(task));
      })
      .catch((err) => console.error(err));
  }

  filterTasks(ev) {
    if (ev.target.id == 'filterTag') {
      this.#filterTagKey = ev.target.value;
    } else if (ev.target.id == 'filterPriority') {
      this.#filterPriorityKey = ev.target.value;
    }

    const timeAnimationRemoveElements = 150;
    this.#apiService.filterTasks(this.#filterPriorityKey, this.#filterTagKey)
      .then((filteredTasks) => {
        this.removeAllTasksFromDom();
        setTimeout(() => {
          filteredTasks.forEach((task) => {
            this.insertTaskIntoDom(task);
          });
        }, timeAnimationRemoveElements);
      });
  }

  removeAllTasksFromDom() {
    for (let i = 0; i < this.shadowRoot.children.length; i++) {
      const appTaskElement = this.shadowRoot.children.item(i);
      const task = appTaskElement.shadowRoot.getElementById('task');
      task.classList.add('fade-out');
      task.addEventListener('animationend', (ev) => {
        appTaskElement.remove();
      });
    }
  }
}


customElements.define('app-main', AppMain);
