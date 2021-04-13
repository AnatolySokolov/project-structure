import RangePicker from '../../components/range-picker';
import SortableTable from '../../components/sortable-table/SalesSortableTable.js';
import header from './sales-header.js';
import fetchJson from '../../utils/fetch-json.js';

export default class Page {
  element;
  subElements;
  components;

  get template() {
    return `
			<div class="sales full-height flex-column">
				<div class="content__top-panel">
					<h1 class="page-title">Sales</h1>
					<div data-element="rangePicker" class="rangepicker"></div>
				</div>
				<div data-element="sortableTable" class="full-height flex-column"></div>
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
    const dateRange = {
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      to: new Date()
    };

    const rangePicker = new RangePicker(dateRange);

    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders?createdAt_gte=${encodeURIComponent(
        dateRange.from
      )}&createdAt_lte${encodeURIComponent(dateRange.to)}`
    });

    this.components = {
      rangePicker,
      sortableTable
    };
  }

  renderComponents() {
    for (const [key, component] of Object.entries(this.components)) {
      const container = this.subElements[key];

      container.append(component.element);
    }
  }

  initEventListeners() {
    this.subElements.rangePicker.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  async updateComponents(from, to) {
    const url = this.components.sortableTable.url;

    url.searchParams.set('createdAt_gte', from);
    url.searchParams.set('createdAt_lte', to);

    const data = await fetchJson(url);

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
