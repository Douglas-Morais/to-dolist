export default class Task {
  id;
  description;
  created;
  deadline;
  isComplete;

  constructor(id, description, created, deadline) {
    this.id = id;
    this.description = description;
    this.created = created;
    this.deadline = deadline;
    this.isComplete = false;
  }
}