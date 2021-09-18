
export class AppTask extends HTMLElement {
  pathIconEdit = '../assets/icons/pen-alt-solid.svg';
  pathIconMinus = '../assets/icons/minus-square-solid.svg';
  pathIconCheck = '../assets/icons/check-solid.svg';
  pathIconHand = '../assets/icons/hand-ok-solid.svg';
  pathIconDoubleCheck = '../assets/icons/check-double-solid.svg';

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

  }

}


customElements.define('app-task', AppTask);