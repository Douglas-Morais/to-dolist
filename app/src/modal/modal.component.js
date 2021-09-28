import { API_SERVICE } from "../service/api.service.js";
import ITag from "../interface/tag.js";
import { EVENT_EMITTER } from "../service/event-emitter.js";

export class AppModal extends HTMLElement {
  #apiService;
  #formTag;
  #eventEmitter;
  #modalElement;

  constructor() {
    super();
    this.#apiService = API_SERVICE;
    this.#eventEmitter = EVENT_EMITTER;
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(this.buildStyle());
    shadow.appendChild(this.buildTemplate());
    this.shadowRoot.getElementById('close').addEventListener('click', this.closeModal.bind(this));
    this.#formTag = this.shadowRoot.getElementById('formTag');
    this.#formTag.addEventListener('submit', this.saveTag.bind(this));
    this.#modalElement = this.shadowRoot.getElementById('modal');
  }

  buildTemplate() {
    const template = `
      <link rel="stylesheet" href="./style.css">
      <form name="formTag" id="formTag">
        <div class="modal" id="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Criando Tag</h2>
              <span id="close">&times;</span>
            </div>
            <div class="modal-body">
              <div class="form-control">
                <label for="input-description">Insira nova Tag</label>
                <input id="input-description" type="text" placeholder="Ex: Trabalho, Escritório, etc..." name="description" autocomplete="off"
                  minlength="3" maxlength="40" required/>
                <div class="fas fa-times-circle"></div>
                <div class="fas fa-check-circle"></div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="submit">Salvar</button>
            </div>
          </div>
        </div>
      </form>
    `;

    const modal = document.createElement('div');
    modal.classList = 'modal';
    modal.innerHTML = template;
    
    return modal
  }

  buildStyle() {
    const style = document.createElement('style');
    style.innerText = `
      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, .3);
        z-index: 1;
        display: flex;
        opacity: 1;
        transition: all 350ms ease-in;
      }

      .modal.fade-out {
        opacity: 0;
      }

      .modal.fade-out .modal-content {
        transform: translateY(40%);
      }
  
      .modal-content {
        position: relative;
        background-color: #f7f7f7;
        margin: auto;
        padding: 0;
        border-radius: 10px;
        width: 80%;
        box-shadow: 0 0 20px 2px rgba(225, 255, 255, 0.7);
        animation-name: animatetop;
        animation-duration: 350ms;
        color: rgb(46, 46, 46);
        transition: transform 350ms ease-in;
      }
  
      @keyframes animatetop {
        from {
          transform: translateY(-40%);
          opacity: 0;
        }  
        to {
          transform: translateY(0%);
          opacity: 1;
        }
      }
  
      .modal-header {
        display: flex;
        justify-content: space-between;
        padding: 10px 15px;
        color: rgb(46, 46, 46);
        border-radius: 10px 10px 0px 0px;
        border-bottom: 1px solid rgb(204, 204, 204);
      }
  
      .modal-header span {
        cursor: pointer;
        font-size: 1.7rem;
        transition: all 180ms;
      }
  
      .modal-body {
        padding: 20px 16px;
        min-height: 100px;
      }

      .modal-body label {
        color:rgb(46, 46, 46);
      }
      .modal-body input {
        outline: auto;
      }
      .modal-body input:focus {
        outline: auto;
      }
  
      .modal-footer {
        display: flex;
        justify-content: end;
        padding: 10px 15px;
        border-radius: 0px 0px 10px 10px;
      }
    `;
    return style;
  }

  closeModal(ev) {
    this.#modalElement.classList.add('fade-out');
    this.#modalElement.addEventListener('transitionend', (ev) => {
      this.parentNode.removeChild(this);      
    });
  }

  saveTag(ev) {
    ev.preventDefault();
    const formData = new FormData(ev.target);
    let formProps = Object.fromEntries(formData);

    const dataTag = new ITag(undefined, formProps.description.toLowerCase());
    this.#apiService.createTag(dataTag)
      .then((tag) => {
        this.#formTag.reset();
        this.closeModal();
        this.#eventEmitter.emit('createdTag',tag);
      })
      .catch((err) => {
        alert('Tag Existente! Por favor confira no campo Tag.');
        console.error(err);
      });      
  }
}

customElements.define('app-modal', AppModal);
