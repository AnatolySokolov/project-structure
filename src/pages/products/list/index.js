import SortableTable from '../../../components/sortable-table';
import header from './products-header.js';

export default class Page {
	element;
	subElements = {};

	get template() {
		return `
			<div class="products-list">
				<div class="content__top-panel">
					<h1 class="page-title">Товары</h1>
					<a href="/products/add" class="button-primary">Добавить товар</a>
				</div>

				<div class="content-box content-box_small">
					<form class="form-inline">
						<div class="form-group">
						  <label class="form-label">Сортировать по:</label>
            	<input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
						</div>

						<div data-element="doubleSlider" class="form-group"></div>

						<div class="form-group">
            	<label class="form-label">Статус:</label>
            	<select class="form-control" data-element="filterStatus">
              	<option value="" selected="">Любой</option>
              	<option value="1">Активный</option>
              	<option value="0">Неактивный</option>
            	</select>
						</div>
					</form>
				</div>

				<div data-element="sortableTable" class="products-list__container"></div>
			</div>
		`;
	}

	render() {
		const wrapper = document.createElement('div');

		wrapper.innerHTML = this.template;
		this.element = wrapper.firstElementChild;
		this.subElements = this.getSubElements(this.element);

		this.initComponents();
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

  initComponents() {
  	const sortableTable = new SortableTable(
  		header,
  		{ url: 'api/rest/products' }  		
  	);

  	this.components = {
  		sortableTable
  	}
  }

  renderComponents() {
  	console.log(this.subElements);

  	for (const [key, component] of Object.entries(this.components)) {
  		const container = this.subElements[key];

  		container.append(component.element);
  	}
  }

  remove() {
  	this.element.remove();
  }

  destroy() {
  	this.remove();

  	for (const component of Object.values(this.components)) {
  		component.destroy();
  	}
  }
}