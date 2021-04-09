import Category from '../../components/categories';
import NotificationMessage from '../../components/notification';
import fetchJson from '../../utils/fetch-json.js';

export default class Page {
	element;
	subElements = {};
	components = {};
  categories = [];

  onSortableListReorder = async event => {
    const {from, to} = event.detail;
    const id = event.target.closest('[data-id]').dataset.id;
    const subcategories = this.categories.find(item => item.id === id).subcategories;
    const category = subcategories.splice(from, 1);

    subcategories.splice(to, 0, ...category);
    subcategories.forEach((item, i) => item.weight = i + 1);

    const response = await fetchJson(new URL('api/rest/subcategories', process.env.BACKEND_URL), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(subcategories)
    });

    let notification;

    if (response) {
      notification = new NotificationMessage('category order saved');
    } else {
      notification = new NotificationMessage('category order didn`t save', {type: 'error'});
    }

    notification.show();
  }

	get template() {
		return `
			<div class="categories">
				<div class="content__top-panel">
					<h1 class="page-title">Категории товаров</h1>
				</div>
				<div data-element="categories">
				</div>
			</div>
		`;
	}

	render() {
		const wrapper = document.createElement('div');

		wrapper.innerHTML = this.template;
		this.element = wrapper.firstElementChild;
		this.subElements = this.getSubElements(this.element);

    this.renderComponents();

		return this.element;
	}

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async renderComponents() {
  	const url = 'https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory';
  	const data = await fetchJson(url);
    const categories = data.map(item => new Category(item).element);

    this.categories = data;
  	this.subElements.categories.append(...categories);
    this.initEventListeners();
  }

  initEventListeners() {
    this.subElements.categories.addEventListener('pointerdown', Category.onCategoriesPointerdown);
    this.subElements.categories.addEventListener('sortable-list-reorder', this.onSortableListReorder);
  }

  destroy() {
    this.element.remove();
    this.subElements = {};
    this.components = {};
  }
}
