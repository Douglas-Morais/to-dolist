
export class AppTask extends HTMLElement {
  pathIconDoubleCheck = '../assets/icons/check-double-solid.svg';
  pathIconHandOk = '../assets/icons/hand-ok-solid.svg';

  inputDescription;
  buttonCheck;
  buttonRemove;
  buttonEdit;

  idTask;

  constructor() {
    super();
  }

  connectedCallback() {
    this.idTask = this.getAttribute('id');
    this.build();
  }


  build() {
    const template = document.getElementById('task-template');
    const templateContent = template.content;

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(templateContent.cloneNode(true));

    const descriptionTask = this.getAttribute('description');
    this.inputDescription = this.shadowRoot.getElementById('description');
    this.inputDescription.value = descriptionTask;

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
    if(!this.inputDescription.hasAttribute('checked')) {
      this.inputDescription.removeAttribute('readonly');
      this.inputDescription.select();
      this.inputDescription.style.borderBottomColor = 'var(--main-white)';
      this.inputDescription.style.color = 'var(--main-white)';
      this.inputDescription.onkeydown = ({key, ...event}) => {
        if(key === 'Enter') {
          this.inputDescription.blur();
          this.inputDescription.style.borderBottomColor = 'var(--main-yellow)';
          this.inputDescription.style.color = 'var(--main-yellow)';
        }
      };
    }
  }

  checkTask() {
    this.inputDescription.setAttribute('checked', '');
    this.buttonCheck.setAttribute('src', this.pathIconDoubleCheck);
    this.buttonEdit.setAttribute('src', this.pathIconHandOk);
    this.buttonEdit.classList.remove('btn-edit');
  }

  removeTask() {
    const elTask = this.shadowRoot.getElementById('task');
    const taskList = document.getElementById('list-nav');
    elTask.classList.add('fade-leave');
    elTask.addEventListener('transitionend', () => this.remove());
  }

}


customElements.define('app-task', AppTask);