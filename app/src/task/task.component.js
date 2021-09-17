
export class AppTask extends HTMLElement {
  pathIconEdit = '../assets/icons/pen-alt-solid.svg';
  pathIconMinus = '../assets/icons/minus-square-solid.svg';
  pathIconCheck = '../assets/icons/check-solid.svg';
  pathIconHand = '../assets/icons/hand-ok-solid.svg';
  pathIconDoubleCheck = '../assets/icons/check-double-solid.svg';

  constructor() {
    super();

    this.build();
  }

  build() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(this.style());
    
    const task = this.createTaskField();
    const leftCol = this.createCol(1, ['elements-center-xy']);
    const iconEdit = this.createImgIcon(this.pathIconEdit, 'Editar', []);

    leftCol.appendChild(iconEdit);
    task.appendChild(leftCol);
    
    const centerCol = this.createCol(10, ['tooltip']);
    const form = this.createForm('formEdit', true, 'Vencendo em breve');
    centerCol.appendChild(form);
    task.appendChild(centerCol);

    shadow.appendChild(task);
  }

  createTaskField() {
    const field = document.createElement('div');
    field.classList.add('row');

    return field;
  }

  createCol(sizeId, arrayClassesAppend) {
    const classesAppend = [...arrayClassesAppend];
    
    const col = document.createElement('div');
    col.classList.add(`col-${sizeId}`);

    classesAppend.forEach( value => col.classList.add(value));

    return col
  }

  createImgIcon(pathIcon, altText, arrayClassesAppend) {
    const classesAppend = [...arrayClassesAppend];

    const img = document.createElement('img');
    img.setAttribute('src', pathIcon);
    img.setAttribute('alt', altText);
    img.setAttribute('height', 20);

    classesAppend.forEach( value => img.classList.add(value));

    return img
  }

  createForm(nameIdForm, hasTooltip, tooltipText) {
    const form = document.createElement('form');
    form.setAttribute('id', nameIdForm);

    if (hasTooltip) {
      form.appendChild(this.createTooltip(tooltipText));
    }

    form.appendChild(this.createInputTaskEdit(['input-plain-text']));

    return form
  }

  createTooltip(tooltipText) {
    const span = document.createElement('span');
    span.classList.add('tooltiptext');
    span.innerHTML = tooltipText;

    return span
  }

  createInputTaskEdit(arrayClassesAppend){
    const classesAppend = [...arrayClassesAppend];

    const inputEdit = document.createElement('input');
    inputEdit.setAttribute('type', 'text');
    inputEdit.setAttribute('name', 'text');
    inputEdit.setAttribute('autocomplete', 'off');

    classesAppend.forEach( value => inputEdit.classList.add(value));
    
    return inputEdit
  }

  style() {
    const style = document.createElement('style');
    style.textContent = `
      .row::after {
        content: "";
        clear: both;
        display: table;
        padding: 0px 0px 12px 0px;
      }
      [class*="col-"] {
        float: left;
        min-height: 35px;
        padding: 0px 3px;
      }
      .col-1 {
        width: 8.33%;
      }      
      .col-9 {
        width: 75%;
      }
      .elements-center-xy {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .tooltip {
        position: relative;
        display: inline-block;
      }
      
      .tooltip .tooltiptext {
        visibility: hidden;
        width: 200px;
        background-color: rgb(26, 26, 26);
        color: #fff;
        text-align: center;
        border-radius: 5px;
        padding: 5px 0;
        position: absolute;
        bottom: 125%;
        left: 50%;
        margin-left: -100px;
        z-index: 1090;
        opacity: 0;
        transition: opacity 0.25s;
      }
      .tooltip .tooltiptext::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #555 transparent transparent transparent;
      }
      .tooltip:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
      }
      input {
        width: 100%;
        height: 35px;
        padding: 2px 10px;
        margin: 5px 0px;
        background-color: var(--main-white);
        border-radius: 5px;
        transition: box-shadow 150ms ease-out;
        font-size: 1rem;
      }
      
      input[class*="input-"] {
        background-color: transparent;
        border-bottom: 1px solid var(--main-yellow);
      }
      
      input[class*="input-"]:focus {
        box-shadow: none;
      }
      
      input[checked] {
        border-bottom: none;
        text-decoration: line-through;
        color: var(--main-green);
        font-size: 1rem;
      }
      
      input[type="Date"] {
        border-bottom: none;
        font-size: 1rem;
        font-family: sans-serif;
      }
      
      
      .input-plain-text {
        text-align: left;
        color: var(--main-yellow);
      }
      
      input:focus {
        outline: none;
        box-shadow: 0 0 5px 1px var(--main-white);
      }
      
      ::placeholder {
        color: var(--main-black);
        opacity: 1;
      }
    `;

    return style;
  }

}

customElements.define('app-task', AppTask);