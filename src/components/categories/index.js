import SortableList from '../sortable-list';

export default class Category {
	element;

	static onCategoriesPointerdown = (event) => {
		const header = event.target.closest('.category__header');

		if (header) header.parentElement.classList.toggle('category_open');		
	}

	constructor(item = {}, container) {
		this.item = item;
		this.container = container;

		this.render();
	}

	get template() {
		return `
			<div class="category category_open" data-id="${this.item.id}">
				<header class="category__header">${this.item.title}</header>
				<div class="category__body">
					<div class="subcategory-list"></div>
				</div>
			</div>
		`;
	}

	render() {
		const wrapper = document.createElement('div');

		wrapper.innerHTML = this.template;
		this.element = wrapper.firstElementChild;

		const container = this.element.querySelector('.subcategory-list');
		const items = this.item.subcategories.map(category => this.getCategoryItem(category));
		const sortableList = new SortableList(items);

		container.append(sortableList.element);

		return this.element;
	}

	getCategoryItem(category) {
		const wrapper = document.createElement('div');

		wrapper.innerHTML = this.getItemTemplate(category);

		return wrapper.firstElementChild;
	}

	getItemTemplate(item) {
		return `
			<li class="categories__sortable-list-item" data-grab-handle="" data-id="${item.id}">
				<strong>${item.title}</strong>
				<span><b>${item.count}</b> products</span>
			</li>
		`;
	}

	destroy() {
		this.element.remove();
	}
}