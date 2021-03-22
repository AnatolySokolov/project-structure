import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

export default class ProductForm {
  element;
  subElements = {};
  url = new URL('api/rest/products', process.env.BACKEND_URL);

  constructor (productId) {
    this.productId = productId;

    this.renderForm();
    this.addListeners();
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">

          <div class="form-group form-group__half_left">
            ${this.createFieldset('Название товара', 'title', 'text', 'Название товара', true)}
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description"
            data-form="description" placeholder="Описание товара"></textarea>
          </div>

          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
            <input data-element="upload" name="upload" type="file" hidden>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id="subcategory" data-form="subcategory" class="form-control" name="subcategory">
              <option value="">Категория &gt; Подкатегория</option>
            </select>
          </div>

          <div class="form-group form-group__half_left form-group__two-col">
            ${this.createFieldset('Цена ($)', 'price', 'number', '100', true)}
            ${this.createFieldset('Скидка ($)', 'discount', 'number', '0', true)}
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input data-form="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select data-form="status" class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>

        </form>
      </div>
    `;
  }

  createFieldset(productName = '', name = '', type = 'text', placeholder = '', isReuired = false) {
    return `
      <fieldset>
        <label class="form-label">${productName}</label>
        <input
          data-form="${name}"
          class="form-control"
          name="${name}"
          type="${type}"
          placeholder="${placeholder}"
          required="${isReuired}">
      </fieldset>
    `;
  }

  renderOptions(arr = []) {
    return arr
      .map(item => {
        return item.subcategories
          .map(subcat => `<option value="${subcat.id}">${item.title} &gt; ${subcat.title}</option>`)
          .join('');
      })
      .join('');
  }

  getImageElement(image = {}) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item" style="">
        <input type="hidden" name="url" value="${image.url}">
        <input type="hidden" name="source" value="${image.source}">
        <span>
          <img src="/assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(image.url)}">
          <span>${escapeHtml(image.source)}</span>
        </span>
        <button type="button">
          <img src="/assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;

    return wrapper.firstElementChild;
  }

  renderImages(images) {
    const items = images.map(image => this.getImageElement(image));
    const sortableList = new SortableList(items);

    this.subElements.imageListContainer.append(sortableList.element);
  }

  renderForm() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce( (acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  async render () {
    if (!this.productId) return this.element;

    const categories = fetchJson(`${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`);
    const product = this.loadProductById(this.productId);
    const [categoriesResponse, productResponse] = await Promise.all([categories, product]);

    if (categoriesResponse) {
      const options = this.renderOptions(categoriesResponse);

      this.subElements.productForm.subcategory.innerHTML = options;
    }

    if (productResponse) {
      this.update(...productResponse);

      return this.element;
    }
  }

  async loadProductById(id) {
    this.url.searchParams.set('id', id);

    return await fetchJson(this.url);
  }

  setCategory(category) {
    const select = this.subElements.productForm.subcategory;
    const selectedOption = Array.from(select.options).find(option => option.value === category);

    if (selectedOption) selectedOption.selected = true;
  }

  update(product = {}) {
    this.subElements.productForm.title.value = product.title;
    this.subElements.productForm.description.value = product.description;
    this.setCategory(product.subcategory);
    this.subElements.productForm.price.value = product.price;
    this.subElements.productForm.discount.value = product.discount;
    this.subElements.productForm.quantity.value = product.quantity;
    this.subElements.productForm.status.value = product.status;
    this.renderImages(product.images);
  }

  upload = async () => {
    const [file] = this.subElements.productForm.upload.files;
    const formData = new FormData();
    const result = {
      source: file.name
    };

    formData.append('image', file);

    try {
      const response = await fetchJson('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
        },
        body: formData
      });

      const { data } = await response;

      result.url = data.link;

      const image = this.getImageElement(result);

      image.classList.add('sortable-list__item');
      this.subElements.imageListContainer.querySelector('.sortable-list').append(image);
    } catch (err) {
      console.error(err);
    }
  }

  onUploadImageClick = () => {
    this.subElements.upload.click();
  }

  getFormElementsData() {
    const data ={};
    const elements = this.element.querySelectorAll('[data-form]');

    [...elements].forEach(element => data[element.name] = element.value);

    const urls = this.element.querySelectorAll('[name="url"]');
    const sources = this.element.querySelectorAll('[name="source"]');
    data.images = [];

    [...urls].forEach((item, i) => {
      data.images.push({
        "url": item.value,
        "source": sources[i].value
      })
    });

    if (this.productId) data.id = this.productId;

    return data;
  }

  onFormSubmit = async event => {
    event.preventDefault();

    const response = await fetchJson(this.url, {
      method: this.productId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.getFormElementsData()),
    });

    const customEvent = this.productId
      ? new CustomEvent('product-updated', { detail: this.productId })
      : new CustomEvent('product-saved', { detail: response.id });

    this.element.dispatchEvent(customEvent);
  }

  addListeners() {
    this.subElements.upload.addEventListener('change', this.upload);
    this.subElements.productForm.uploadImage.addEventListener('click', this.onUploadImageClick);
    this.subElements.productForm.addEventListener('submit', this.onFormSubmit);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = null;
  }
}
