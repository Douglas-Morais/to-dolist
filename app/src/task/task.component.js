
export class AppTask extends HTMLElement {
  pathIconEdit = '../assets/icons/pen-alt-solid.svg';
  pathIconMinus = '../assets/icons/minus-square-solid.svg';
  pathIconCheck = '../assets/icons/check-solid.svg';
  pathIconHand = '../assets/icons/hand-ok-solid.svg';
  pathIconDoubleCheck = '../assets/icons/check-double-solid.svg';

  idTask = 0;

  constructor() {
    super();
    this.build();
  }


  build() {
    const template = document.getElementById('task-template');
    const templateContent = template.content;
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(templateContent.cloneNode(true));
  }

}


customElements.define('app-task', AppTask);