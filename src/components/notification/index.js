export default class NotificationMessage {
  static element = null;

  constructor(message = '', { duration = 2000, type = 'success' } = {}) {
    if (NotificationMessage.element) NotificationMessage.element.remove();

    this.message = message;
    this.duration = duration;
    this.durationInSeconds = Math.floor(duration / 1000) + 's';
    this.type = type;
    this.render();
  }

  get template() {
    return `
      <div class="notification notification_${this.type} show" style="--value:${
      this.duration / 1000
    }s">
        <div class="notification__content">
          ${this.message}
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    NotificationMessage.element = this.element;
  }

  show(parent = document.body) {
    parent.append(this.element);
    setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    NotificationMessage.element = null;
  }
}
