import Task from "../interface/task.js";
import { API_SERVICE } from "../service/api.service.js";

export class AppTask extends HTMLElement {
  pathIconDoubleCheck = '../assets/icons/check-double-solid.svg';
  pathIconHandOk = '../assets/icons/hand-ok-solid.svg';

  inputDescription;
  buttonCheck;
  buttonRemove;
  buttonEdit;

  task;
  apiService;

  constructor() {
    super();
    this.apiService = API_SERVICE;
  }

  connectedCallback() {
    const taskObject = JSON.parse(this.getAttribute('data-object'));
    this.task = new Task(
      taskObject.id,
      taskObject.description,
      taskObject.created,
      taskObject.deadline
    );
    this.build();
  }


  build() {
    const template = document.getElementById('task-template');
    const templateContent = template.content;

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(templateContent.cloneNode(true));

    this.inputDescription = this.shadowRoot.getElementById('description');
    this.inputDescription.value = this.task.description;

    this.buttonCheck = this.shadowRoot.getElementById('check');
    this.buttonCheck ? this.buttonCheck.addEventListener('mouseover', this.checkFxMouseOver.bind(this)) : null;
    this.buttonCheck ? this.buttonCheck.addEventListener('mouseout', this.checkFxMouseOut.bind(this)) : null;
    this.buttonCheck ? this.buttonCheck.addEventListener('click', this.checkTask.bind(this)) : null;

    this.buttonRemove = this.shadowRoot.getElementById('remove');
    this.buttonRemove ? this.buttonRemove.addEventListener('click', this.removeTask.bind(this)) : null;

    this.buttonEdit = this.shadowRoot.getElementById('edit');
    this.buttonEdit ? this.buttonEdit.addEventListener('click', this.editTask.bind(this)) : null;

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
    if (!this.inputDescription.hasAttribute('checked')) {

      this.inputDescription.removeAttribute('readonly');
      this.inputDescription.select();

      this.inputDescription.classList.add('editing');

      const editConfirm = () => {
        this.task.description = this.inputDescription.value;
        this.apiService.updateTask(this.task)
          .then(() => {
            this.inputDescription.classList.remove('editing');
            this.inputDescription.setAttribute('readonly', '');
          });
      };

      this.inputDescription.onkeydown = ({ key, ...event }) => {
        if (key === 'Enter') {
          editConfirm();
        }
      };

      this.inputDescription.onblur = (ev) => {
        if (!this.inputDescription.hasAttribute('readonly')) {
          editConfirm();
        }
      };
    }

  }

  checkTask() {
    this.inputDescription.setAttribute('checked', '');
    this.buttonCheck.setAttribute('src', this.pathIconDoubleCheck);
    this.buttonEdit.setAttribute('src', this.pathIconHandOk);
    this.buttonEdit.classList.remove('btn-edit');
    this.buttonCheck.removeEventListener('click', null);
    this.buttonEdit.removeEventListener('click', null);
  }

  removeTask() {
    this.apiService.deleteTask(this.task)
      .then(() => {
        const elTask = this.shadowRoot.getElementById('task');
        elTask.classList.remove('fade-in');
        elTask.addEventListener('transitionend', () => this.remove());
      })
      .catch((err) => console.error(err));

  }

}


customElements.define('app-task', AppTask);