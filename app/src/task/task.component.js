import ITask from "../interface/task.js";
import { API_SERVICE } from "../service/api.service.js";
import { EVENT_EMITTER } from "../service/event-emitter.js";

export class AppTask extends HTMLElement {
  #inputDescription;
  #buttonCheck;
  #buttonRemove;
  #buttonEdit;
  #taskElement;
  #task;
  #apiService;
  #eventEmitter;
  #formEditTask;

  constructor() {
    super();
    this.#apiService = API_SERVICE;
    this.#eventEmitter = EVENT_EMITTER;
  }

  connectedCallback() {
    const taskObject = JSON.parse(this.getAttribute('data-object'));
    this.#task = new ITask(
      taskObject.id,
      taskObject.description,
      taskObject.created,
      taskObject.deadline,
      taskObject.priorityKey,
      taskObject.tagKey
    );
    this.build();
    this.#formEditTask = this.shadowRoot.getElementById('formEditTask');
    this.#formEditTask.addEventListener('input', this.validateFormEditTask.bind(this));
    this.#formEditTask.addEventListener('submit', this.submitFormEditTask.bind(this));
    this.#taskElement = this.shadowRoot.getElementById('task');
    if (this.hasAttribute('done')) {
      this.#taskElement.classList.add('done');
      this.#inputDescription.setAttribute('checked', '');
    };
    this.#eventEmitter.on('updatedTask', this.updateTask.bind(this));
  }

  build() {
    const checkTask = (ev) => {
      ev.target.removeEventListener('click', this.checkTask)

      if (this.#inputDescription.hasAttribute('checked')) return;
      this.#apiService.checkTask(this.#task)
        .then((task) => {
          this.setAttribute('done', '');
          this.#taskElement.classList.add('done');
          this.children.namedItem('deadline').textContent = 'Concluído';
          this.#inputDescription.setAttribute('checked', '');
        })
        .catch((err) => console.error(err))
        .finally(() => {
          this.#buttonEdit.removeEventListener('click', editTask, false);
          this.#buttonCheck.removeEventListener('click', checkTask, false);
        });
    };

    const editTask = (ev) => {
      const appModal = document.createElement('app-modal-task-edit');
      appModal.classList.add('fade-in');
      appModal.setAttribute('data-object', JSON.stringify(this.#task));
      document.body.appendChild(appModal);
    };

    const template = document.getElementById('task-template');
    const templateContent = template.content;

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(templateContent.cloneNode(true));

    this.#inputDescription = this.shadowRoot.getElementById('description');
    this.#inputDescription.value = this.#task.description;

    this.#buttonRemove = this.shadowRoot.getElementById('remove');
    this.#buttonRemove ? this.#buttonRemove.addEventListener('click', this.removeTask.bind(this)) : null;

    this.#buttonEdit = this.shadowRoot.getElementById('edit');
    this.#buttonCheck = this.shadowRoot.getElementById('check');

    if (this.hasAttribute('done')) return
    this.#buttonEdit.addEventListener('click', editTask);
    this.#buttonCheck.addEventListener('click', checkTask);
  }


  // First version for editing task.
  // Only description field of each task was changed.
  /* editTask(ev) {

    if (this.#inputDescription.hasAttribute('checked')) return
    const oldInputValue = this.#inputDescription.value;

    this.#inputDescription.removeAttribute('readonly');
    this.#inputDescription.select();
    this.#inputDescription.classList = 'input-plain-text editing';

    this.#inputDescription.onkeydown = ({ key, ...event }) => {
      if (key === 'Escape') {
        this.#inputDescription.setSelectionRange(0, 0, 'none');
        this.#inputDescription.blur();
      }
    };

    this.#inputDescription.onblur = (ev) => {
      if (this.#inputDescription.hasAttribute('readonly')) return

      this.#inputDescription.value = oldInputValue;
      this.#inputDescription.classList = 'input-plain-text';
      this.#inputDescription.setAttribute('readonly', '');
    };
  } */

  updateTask(taskUpdated) {
    if (taskUpdated.id !== this.#task.id) return
    this.#task = taskUpdated;
    this.#inputDescription.value = taskUpdated.description;
    this.children.namedItem('deadline').textContent = new Date(taskUpdated.deadline).toLocaleDateString()
    this.#apiService.getPriorityDescriptionByKey(taskUpdated.priorityKey)
      .then((priorityDescription) => {
        this.children.namedItem('priorityKey').textContent = priorityDescription;
      });
    this.#apiService.getTagDescriptionByKey(taskUpdated.tagKey)
      .then((tagDescription) => {
        this.children.namedItem('tagKey').textContent = tagDescription;
      });
  }

  validateFormEditTask(evInput) {
    if (evInput.target.name === 'description') {
      if (evInput.target.checkValidity()) {
        evInput.target.classList.add('success');
        evInput.target.classList.remove('error');
      } else {
        evInput.target.classList.remove('success');
        evInput.target.classList.add('error');
      }
    }
  }

  submitFormEditTask(evSubmit) {
    evSubmit.preventDefault();
    const formData = new FormData(evSubmit.target);
    let formProps = Object.fromEntries(formData);

    const dataTask = new ITask(
      undefined,
      formProps.description.trim(),
      new Date(),
      new Date(formProps.deadline)
    );

    this.#task.description = this.#inputDescription.value;
    this.#apiService.updateTask(this.#task)
      .then((updatedTask) => {
        this.#inputDescription.classList = 'input-plain-text';
        this.#inputDescription.setAttribute('readonly', '');
      });
  }

  removeTask() {
    this.#apiService.deleteTask(this.#task)
      .then(() => {
        const elTask = this.shadowRoot.getElementById('task');
        elTask.classList.add('fade-out');
        elTask.addEventListener('animationend', () => this.remove());
      })
      .catch((err) => console.error(err));
  }
}

customElements.define('app-task', AppTask);
