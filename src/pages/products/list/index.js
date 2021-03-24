import SortableTable from '../../../components/sortable-table';
import DoubleSlider from '../../../components/double-slider';
import header from './products-header.js';
import fetchJson from '../../../utils/fetch-json.js';

export default class Page {
	element;
	subElements = {};

  onInput = event => {
    const key = event.target.dataset.element;
    const value = event.target.value;
    const queryParams = {
      [key]: value
    };

    this.updateComponents(queryParams);
  }

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

						<div data-element="doubleSlider" class="form-group">
              <label class="form-label">Цена:</label>
            </div>

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
    this.initEventListeners();

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

    const doubleSlider = new DoubleSlider({min: 0, max: 4000});

  	this.components = {
  		sortableTable,
      doubleSlider
  	}
  }

  renderComponents() {
  	for (const [key, component] of Object.entries(this.components)) {
  		const container = this.subElements[key];

  		container.append(component.element);
  	}
  }

  initEventListeners() {
    this.subElements.doubleSlider.addEventListener('range-select', event => this.updateComponents(event.detail));
    this.subElements.filterName.addEventListener('input', this.onInput);
    this.subElements.filterStatus.addEventListener('input', this.onInput);
  }

  async updateComponents(queryParams = {}) {
    const queryMap = {
      filterName: 'title_like',
      filterStatus: 'status',
      from: 'price_gte',
      to: 'price_lte',
    }

    const getQuery = (queryParams = {}) => {
      const url = this.components.sortableTable.url;

      for (const key of Object.keys(queryParams)) {
        url.searchParams.set(queryMap[key], queryParams[key]);
      }

      return url;
    }

    const query = getQuery(queryParams);
    const data = await fetchJson(query);

    this.components.sortableTable.update(data);
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
