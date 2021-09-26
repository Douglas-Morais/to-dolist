import ITask from "../interface/task.js";
import { API_SERVICE } from "../service/api.service.js";

export class AppTask extends HTMLElement {
  #pathIconDoubleCheck = '../assets/icons/check-double-solid.svg';
  #pathIconHandOk = '../assets/icons/hand-ok-solid.svg';

  #inputDescription;
  #buttonCheck;
  #buttonRemove;
  #buttonEdit;

  #task;
  #apiService;
  #formEditTask;

  constructor() {
    super();
    this.#apiService = API_SERVICE;
  }

  connectedCallback() {
    const taskObject = JSON.parse(this.getAttribute('data-object'));
    this.#task = new ITask(
      taskObject.id,
      taskObject.description,
      taskObject.created,
      taskObject.deadline
    );
    this.build();
    this.#formEditTask = this.shadowRoot.getElementById('formEditTask');
    this.#formEditTask.addEventListener('input', this.validateFormEditTask.bind(this));
    this.#formEditTask.addEventListener('submit', this.submitFormEditTask.bind(this));
  }

  build() {
    const template = document.getElementById('task-template');
    const templateContent = template.content;

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(templateContent.cloneNode(true));

    this.#inputDescription = this.shadowRoot.getElementById('description');
    this.#inputDescription.value = this.#task.description;

    this.#buttonCheck = this.shadowRoot.getElementById('check');
    this.#buttonCheck ? this.#buttonCheck.addEventListener('mouseover', this.checkFxMouseOver.bind(this)) : null;
    this.#buttonCheck ? this.#buttonCheck.addEventListener('mouseout', this.checkFxMouseOut.bind(this)) : null;
    this.#buttonCheck ? this.#buttonCheck.addEventListener('click', this.checkTask.bind(this)) : null;

    this.#buttonRemove = this.shadowRoot.getElementById('remove');
    this.#buttonRemove ? this.#buttonRemove.addEventListener('click', this.removeTask.bind(this)) : null;

    this.#buttonEdit = this.shadowRoot.getElementById('edit');
    this.#buttonEdit ? this.#buttonEdit.addEventListener('click', this.editTask.bind(this)) : null;

  }

  checkFxMouseOver() {
    const elTask = this.shadowRoot.getElementById('task');
    elTask.classList.add('task-check-hover');
  }

  checkFxMouseOut() {
    const elTask = this.shadowRoot.getElementById('task');
    elTask.classList.remove('task-check-hover');
  }

  editTask() {
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

  checkTask() {
    this.#inputDescription.setAttribute('checked', '');
    this.#buttonCheck.setAttribute('src', this.#pathIconDoubleCheck);
    this.#buttonEdit.setAttribute('src', this.#pathIconHandOk);
    this.#buttonEdit.classList.remove('btn-edit');
    this.#buttonCheck.removeEventListener('click', null);
    this.#buttonEdit.removeEventListener('click', null);
  }

  removeTask() {
    this.#apiService.deleteTask(this.#task)
      .then(() => {
        const elTask = this.shadowRoot.getElementById('task');
        elTask.classList.add('fade-out');
        console.warn('fade out')
        elTask.addEventListener('animationend', () => this.remove());
      })
      .catch((err) => console.error(err));
  }
}

customElements.define('app-task', AppTask);
