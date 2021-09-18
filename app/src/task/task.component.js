
export class AppTask extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    this.build();
  }


  build() {
    let templateNameId = 'task-todo';
    if (this.hasAttribute('done')) { templateNameId = 'task-done' }

    const template = document.getElementById(templateNameId);
    const templateContent = template.content;

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(templateContent.cloneNode(true));

    const descriptionTask = this.getAttribute('description');
    const inputDescription = this.shadowRoot.getElementById('description');
    inputDescription.value = descriptionTask;

    const check = this.shadowRoot.getElementById('check');
    check ? check.addEventListener('mouseover', this.checkFxMouseOver.bind(this)) : null;
    check ? check.addEventListener('mouseout', this.checkFxMouseOut.bind(this)) : null;
    

  }

  checkFxMouseOver() {
    const elTask = this.shadowRoot.getElementById('task');
    elTask.classList.add('task-check-hover');
  }

  checkFxMouseOut() {
    const elTask = this.shadowRoot.getElementById('task');
    elTask.classList.remove('task-check-hover');
  }

}


customElements.define('app-task', AppTask);