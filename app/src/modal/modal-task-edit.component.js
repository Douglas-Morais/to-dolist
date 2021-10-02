import { API_SERVICE } from "../service/api.service.js";
import { EVENT_EMITTER } from "../service/event-emitter.js";
import ITask from "../interface/task.js";

export class AppModalTaskEdit extends HTMLElement {
  #apiService;
  #formTask;
  #eventEmitter;
  #modalElement;
  #task;
  #selectTagElement;

  constructor() {
    super();
    this.#apiService = API_SERVICE;
    this.#eventEmitter = EVENT_EMITTER;
  }

  connectedCallback() {
    this.style.visibility = 'hidden';
    this.#task = JSON.parse(this.getAttribute('data-object'));
    this.removeAttribute('data-object');
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(this.buildTemplate());
    this.shadowRoot.getElementById('close').addEventListener('click', this.closeModal.bind(this));
    this.#formTask = this.shadowRoot.getElementById('formTask');
    this.#formTask.addEventListener('submit', this.saveTask.bind(this));
    this.#modalElement = this.shadowRoot.getElementById('modal');
    this.#selectTagElement = this.shadowRoot.getElementById('select-tag');
    this.insertTagsOptionIntoModal();
    this.fillInputData();
    const eventStart = this.shadowRoot.getElementById('modal-content')
      .addEventListener('animationstart', () => {
        this.removeAttribute('style');
        this.removeEventListener('animationstart', eventStart);
      });
  }

  buildTemplate() {
    const template = `
      <link rel="stylesheet" href="./style.css">
      <form name="formTask" id="formTask">
        <div class="modal" id="modal">
          <div class="modal-content" id="modal-content">
            <div class="modal-header">
              <h2>Editando Tarefa</h2>
              <span id="close">&times;</span>
            </div>

            <div class="modal-body task">
              <div class="form-control">
                <label for="input-description">Tarefa</label>
                <input id="input-description" type="text" placeholder="tarefa..." name="description" autocomplete="off"
                  minlength="3" maxlength="40" required />
                <div class="fas fa-times-circle"></div>
                <div class="fas fa-check-circle"></div>
                <!-- <small>Error message</small> -->
              </div>
              <div class="form-control">
                <label for="input-deadline">Prazo</label>
                <input id="input-deadline" type="date" name="deadline" autocomplete="off" required />
                <!-- <small>Error message</small> -->
              </div>
              <div class="form-control">
                <label for="input-priorityKey">Prioridade</label>
                <select name="priorityKey" id="input-priorityKey">
                  <option value="1">Urgente</option>
                  <option value="2">Importante</option>
                  <option value="3" selected>Normal</option>
                  <option value="4">Adiável</option>
                </select>
                <div class="fa-exclamation"></div>
              </div>
              <div class="form-control">
                <label for="select-tag">Tag</label>
                <select name="tagKey" id="select-tag"></select>
                <div class="fa-tags"></div>
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
    modal.innerHTML = template;

    return modal
  }

  fillInputData() {
    this.shadowRoot.getElementById('input-description').value = this.#task.description;
    this.shadowRoot.getElementById('input-deadline').value = this.#task.deadline.split('T')[0];
    this.shadowRoot.getElementById('input-priorityKey').value = this.#task.priorityKey;
  }

  insertTagsOptionIntoModal() {
    this.#apiService.getTags()
      .then((tags) => {
        tags.forEach((tag, index) => {
          const optionTag = document.createElement('option');
          optionTag.setAttribute('value', tag.id);
          optionTag.innerText = tag.description;
          if (this.#task.tagKey == tag.id) {
            optionTag.setAttribute('selected', tag.id);
          };
          this.#selectTagElement.appendChild(optionTag);
        });
      })
      .catch((err) => console.error(err));
  }

  closeModal(ev) {
    this.#modalElement.classList.add('fade-out');
    this.#modalElement.addEventListener('transitionend', (ev) => {
      this.parentNode.removeChild(this);
    });
  }

  saveTask(ev) {
    ev.preventDefault();
    const formData = new FormData(ev.target);
    let formProps = Object.fromEntries(formData);

    const dataTag = new ITask(
      this.#task.id,
      formProps.description.trim().toLowerCase(),
      new Date(),
      formProps.deadline,
      formProps.priorityKey,
      formProps.tagKey
    );

    this.#apiService.updateTask(dataTag)
      .then((taskUpdated) => {
        this.#formTask.reset();
        this.closeModal();
        this.#eventEmitter.emit('updatedTask', taskUpdated);
      })
      .catch((err) => {
        alert('Houve um erro ao atualizar a tarefa.');
        console.error(err);
      });
  }
}

customElements.define('app-modal-task-edit', AppModalTaskEdit);
