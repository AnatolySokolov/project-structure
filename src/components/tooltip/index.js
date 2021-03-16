class Tooltip {
  static instance;
  element;

  onMouseMove = event => {
    const shift = 10;
    const bodyBorder = {
      right: document.body.offsetWidth - this.element.offsetWidth - shift
    }

    let left, top;

    if (event.clientX <= bodyBorder.right) {
      left = event.clientX + shift
    } else {
      left = bodyBorder.right;
    }

    top = event.clientY + shift;

    this.element.style.left = left + 'px';
    this.element.style.top = top + 'px';
  }

  onDocumentPointerover = event => {
    const element = event.target.closest('[data-tooltip]');

    if (element) {
      this.render(element.dataset.tooltip);
      document.addEventListener('mousemove', this.onMouseMove);
    }
  }

  onDocumentPointerout = () => {
    if (this.element) {
      document.removeEventListener('mousemove', this.onMouseMove);
      this.element.remove();
    }
  }

  constructor() {
    if (Tooltip.instance) return Tooltip.instance;

    Tooltip.instance = this;
  }

  render(content) {
    this.element = document.createElement('div');
    this.element.innerHTML = content;
    this.element.classList.add('tooltip');
    document.body.append(this.element);
  }

  initialize() {
    document.addEventListener('pointerover', this.onDocumentPointerover);
    document.addEventListener('pointerout', this.onDocumentPointerout);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    Tooltip.instance = null;
    document.removeEventListener('pointerover', this.onDocumentPointerover);
    document.removeEventListener('pointerout', this.onDocumentPointerout);
  }
}

const tooltip = new Tooltip();

export default tooltip;
