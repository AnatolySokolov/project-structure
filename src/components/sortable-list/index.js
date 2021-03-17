export default class SortableList {
  element;

  onDocumentPointermove = ({ clientX, clientY }) => {
    this.moveDraggingAt(clientX, clientY);
    this.draggingItem.style.zIndex = -1;

    const currentItem = document.elementFromPoint(clientX, clientY);

    this.draggingItem.style.zIndex = 10000;

    if (!currentItem.classList.contains('sortable-list__item')) return;

    const { top } = currentItem.getBoundingClientRect();
    const { offsetHeight: height } = currentItem;

    if (clientY < top + height / 2) {
      currentItem.before(this.placeholder);
    } else {
      currentItem.after(this.placeholder);
    }
  }

  onDocumentPointerup = () => {
    this.dragStop();
  }

  constructor({ items = [] } = {}) {
    this.items = items;

    this.render();
  }

  render() {
    this.element = document.createElement('ul');
    this.element.classList.add('sortable-list');
    this.items.forEach(item => item.classList.add('sortable-list__item'));
    this.element.append(... this.items);
    this.element.addEventListener('pointerdown', event => this.onPointerdown(event));
  }

  onPointerdown(event) {
    const item = event.target.closest('.sortable-list__item');

    if (!item) return;

    event.preventDefault();

    if (event.target.closest('[data-grab-handle')) this.dragStart(event, item);
    if (event.target.closest('[data-delete-handle]')) item.remove();
  }

  dragStart({clientX, clientY}, item) {
    this.initialIndex = [...this.element.children].indexOf(item);
    this.initialShift = {
      x: clientX - item.getBoundingClientRect().x,
      y: clientY - item.getBoundingClientRect().y
    };

    this.draggingItem = item;
    this.placeholder = document.createElement('div');
    this.placeholder.classList.add('sortable-list__placeholder');

    item.style.width = item.offsetWidth + 'px';
    item.style.height = item.offsetHeight + 'px';
    this.placeholder.style.width = item.style.width;
    this.placeholder.style.height = item.style.height;

    item.classList.add('sortable-list__item_dragging');
    item.after(this.placeholder);
    this.element.append(item);

    this.moveDraggingAt(clientX, clientY);

    document.addEventListener('pointermove', this.onDocumentPointermove);
    document.addEventListener('pointerup', this.onDocumentPointerup);
  }

  moveDraggingAt(clientX, clientY) {
    this.draggingItem.style.left = clientX - this.initialShift.x + 'px';
    this.draggingItem.style.top = clientY - this.initialShift.y + 'px';
  }

  dragStop() {
    const currnetIndex = [... this.element.children].indexOf(this.placeholder);

    this.placeholder.replaceWith(this.draggingItem);
    this.draggingItem.classList.remove('sortable-list__item_dragging');
    this.draggingItem.style.left = '';
    this.draggingItem.style.top = '';
    this.draggingItem.style.width = '';
    this.draggingItem.style.height = '';
    this.draggingItem = null;

    if (currnetIndex !== this.initialIndex) {
      this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
        bubbles: true,
        detail: {
          from: this.initialIndex,
          to: currnetIndex
        }
      }));
    }

    document.removeEventListener('pointermove', this.onDocumentPointermove);
    document.removeEventListener('pointerup', this.onDocumentPointerup);
  }

  dispatchCustomEvent() {
    this.element.dispatchEvent(new CustomEvent('sortable-list-reorder', {
      bubbles: true,
      detail: {
        from: this.initialIndex,
        to: this.placeholderIndex
      }
    }));
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointermove', this.onDocumentPointermove);
    document.removeEventListener('pointerup', this.onDocumentPointerup);
  }
}
