export default class ITask {
  id;
  description;
  created;
  deadline;
  isComplete;
  priorityKey;
  tagKey;

  constructor(id, description, created, deadline, priorityKey, tagKey) {
    this.id = id;
    this.description = description;
    this.created = created;
    this.deadline = deadline;
    this.isComplete = false;
    this.priorityKey = priorityKey;
    this.tagKey = tagKey;
  }
}
