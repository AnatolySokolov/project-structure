import fetchJson from '../../utils/fetch-json.js';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  sortParams = {};
  filterParams = {};
  isSortLocally = false;
  isRequestSend = false;

  onHeaderPointerdown = async event => {
    const columnHeader = event.target.closest('.sortable-table__cell');
    const { id, order, sortable } = columnHeader.dataset;

    if (sortable === 'false') return;

    const orderToggle = {
      asc: 'desc',
      desc: 'asc'
    };

    columnHeader.dataset.order = orderToggle[order];
    columnHeader.append(this.subElements.arrow);

    this.sortParams._sort = id;
    this.sortParams._order = orderToggle[order];

    if (this.isSortLocally) {
      this.sort(this.sortParams._sort, this.sortParams._order);
    } else {
      this.sortOnServer();
    }
  };

  onDocumentScroll = async () => {
    if (this.isRequestSend || this.isSortLocally) return;

    const { bottom } = document.documentElement.getBoundingClientRect();
    const htmlHeight = document.documentElement.clientHeight;
    const gap = 200;

    if (bottom < htmlHeight + gap) {
      this.isRequestSend = true;
      this.sortParams._start += this.step;
      this.sortParams._end += this.step;

      const data = await this.loadData();

      this.addRows(data);
      this.isRequestSend = false;
    }
  };

  constructor(header = [], { url = '', step = 30, start = 0, isSortLocally = false } = {}) {
    this.header = header;
    this.url = new URL(url, process.env.BACKEND_URL);
    this.step = step;
    this.sortParams._sort = header.find(item => item.sortable).id;
    this.sortParams._order = 'asc';
    this.sortParams._start = start;
    this.sortParams._end = start + step;
    this.isSortLocally = isSortLocally;

    this.render();
    this.addListeners();
  }

  get template() {
    return `
      <div class="sortable-table">

        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getHeaderTemplate()}
        </div>

        <div data-element="body" class="sortable-table__body">
          ${this.getBodyTemplate(this.data)}
        </div>

        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products found matching the selected criteria</p>
            <button data-element="reset" type="button" class="button-primary-outline">Clear filters</button>
          </div>
        </div>

      </div>
    `;
  }

  getHeaderTemplate() {
    return this.header.map(item => this.getHeaderRowTemplate(item)).join('');
  }

  getHeaderRowTemplate({ id, title, sortable }) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" ${
      sortable ? 'data-order="asc"' : ''
    }>
        <span>${title}</span>
        ${this.getHeaderArrowTemplate(id)}
      </div>
    `;
  }

  getHeaderArrowTemplate(id) {
    const template = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;

    return id === this.sortParams._sort ? template : '';
  }

  getBodyTemplate(data) {
    return data
      .map(item => {
        return `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${this.getCellTemplate(item)}
          </a>
        `;
      })
      .join('');
  }

  getCellTemplate(item) {
    return this.header
      .map(({ id, template }) => {
        if (id === 'images' && !item[id].length) {
          return `
            <div class="sortable-table__cell">
              <img class="sortable-table-image" alt="no-image" src="#">
            </div>
          `;
        } else if (template) {
          return template(item[id]);
        } else {
          return `<div class="sortable-table__cell">${item[id]}</div>`;
        }
      })
      .join('');
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const data = await this.loadData();

    this.update(data);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  async loadData(params) {
    this.element.classList.add('sortable-table_loading');

    if (params) {
      this.filterParams = params;
    }

    const url = new URL(this.url);
    const query = Object.assign({}, this.filterParams, this.sortParams);

    for (const key of Object.keys(query)) {
      url.searchParams.set(key, query[key]);
    }

    const data = await fetchJson(url);

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  update(data) {
    if (data.length) {
      this.subElements.body.innerHTML = this.getBodyTemplate(data);
      this.data = data;
      this.element.classList.remove('sortable-table_empty');
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  makeSort(field, order) {
    const arr = [...this.data];
    const { sortType } = this.header.find(item => item.id === field);
    const direction = order === 'asc' ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'string':
          return direction * a[field].localeCompare(b[field], ['ru', 'en'], { caseFirst: 'upper' });
        case 'number':
          return direction * (a[field] - b[field]);
        default:
          return direction * (a[field] - b[field]);
      }
    });
  }

  sort(field, order) {
    const sortedData = this.makeSort(field, order);

    this.subElements.body.innerHTML = this.getBodyTemplate(sortedData);
  }

  async sortOnServer() {
    const data = await this.loadData();

    this.update(data);
  }

  addListeners() {
    this.subElements.header.addEventListener('click', this.onHeaderPointerdown);
    document.addEventListener('scroll', this.onDocumentScroll);
  }

  addRows(data) {
    this.subElements.body.insertAdjacentHTML('beforeend', this.getBodyTemplate(data));
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    document.removeEventListener('scroll', this.onDocumentScroll);
  }
}
