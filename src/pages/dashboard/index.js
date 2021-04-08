import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';
import getFormattedNumber from '../../utils/getFormattedNumber.js';

export default class Page {
  element;
  subElements;
  components;

  get template() {
    return `
      <div class="dashboard full-height flex-column">

        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <div data-element="rangePicker"></div>
        </div>

        <div class="dashboard__charts">
          <div data-element="ordersChart"></div>
          <div data-element="salesChart"></div>
          <div data-element="customersChart"></div>
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
        <div data-element="sortableTable"></div>

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

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: dateRange,
      label: 'orders',
      link:'#'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: dateRange,
      label: 'sales',
      formatHeading: data => `$${getFormattedNumber(data, ',')}`
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: dateRange,
      label: 'customers'
    });

    const sortableTable = new SortableTable(
      header,
      {
        url: `api/dashboard/bestsellers?from=${encodeURIComponent(dateRange.from)}&to${encodeURIComponent(dateRange.to)}`,
        step: 30,
        start: 1,
        isSortLocally: true
      }
    );

    this.components = {
      rangePicker,
      ordersChart,
      salesChart,
      customersChart,
      sortableTable
    };
  }

  renderComponents() {
    for (const [key, component] of Object.entries(this.components)) {
      const container = this.subElements[key];

      container.append(component.element);
    }
  }

  async updateComponents(from, to) {
    const url = this.components.sortableTable.url;

    url.searchParams.set('from', from);
    url.searchParams.set('to', to);

    const data = await fetchJson(url);

    this.components.sortableTable.update(data);
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  initEventListeners() {
    this.subElements.rangePicker.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    })
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
