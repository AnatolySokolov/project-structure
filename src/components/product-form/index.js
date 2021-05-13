import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

export default class ProductForm {
  element;
  subElements = {};
  url = new URL('api/rest/products', process.env.BACKEND_URL);

  constructor(productId) {
    this.productId = productId;

    this.renderForm();
    this.addListeners();
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">

          <div class="form-group form-group__half_left">
            ${this.createFieldset('Product name', 'title', 'text', 'Product name', true)}
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Description</label>
            <textarea required="" class="form-control" name="description"
            data-form="description" placeholder="Product description"></textarea>
          </div>

          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Images</label>
            <div data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" class="button-primary-outline"><span>Upload</span></button>
            <input data-element="upload" name="upload" type="file" hidden>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label">Category</label>
            <select id="subcategory" data-form="subcategory" class="form-control" name="subcategory">              
            </select>
          </div>

          <div class="form-group form-group__half_left form-group__two-col">
            ${this.createFieldset('Price ($)', 'price', 'number', '100', true)}
            ${this.createFieldset('Discount ($)', 'discount', 'number', '0', true)}
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Quantity</label>
            <input data-form="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Status</label>
            <select data-form="status" class="form-control" name="status">
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Save product
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

  getImageElement(image = {}) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item" style="">
        <input type="hidden" name="url" value="${image.url}">
        <input type="hidden" name="source" value="${image.source}">
        <span>
          <img src="https://anatolysokolov.github.io/project-structure/images/icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(image.url)}">
          <span>${escapeHtml(image.source)}</span>
        </span>
        <button type="button">
          <img src="https://anatolysokolov.github.io/project-structure/images/icon-trash.svg" data-delete-handle="" alt="delete">
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

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  getOptions(arr = []) {
    return arr
      .map(item => {
        return item.subcategories
          .map(subcat => `<option value="${subcat.id}">${item.title} &gt; ${subcat.title}</option>`)
          .join('');
      })
      .join('');
  }

  renderCategories(arr = []) {
    const options = this.getOptions(arr);

    this.subElements.productForm.subcategory.innerHTML = options;
  }

  async render() {
    if (!this.productId) {
      const categories = await fetchJson(
        `${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`
      );

      if (categories) {
        this.renderCategories(categories);
      }
    } else {
      const categories = fetchJson(
        `${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`
      );
      const product = this.loadProductById(this.productId);
      const [categoriesResponse, productResponse] = await Promise.all([categories, product]);

      if (categoriesResponse) {
        this.renderCategories(categoriesResponse);
      }

      if (productResponse) {
        this.update(...productResponse);
      }
    }

    return this.element;
  }

  async loadProductById(id) {
    const url = new URL(this.url);

    url.searchParams.set('id', id);

    return await fetchJson(url);
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
  };

  onUploadImageClick = () => {
    this.subElements.upload.click();
  };

  getFormElementsData() {
    const data = {};
    const elements = this.element.querySelectorAll('[data-form]');
    const toNumber = ['price', 'quantity', 'discount', 'status'];

    [...elements].forEach(element => {
      if (toNumber.includes(element.name)) {
        data[element.name] = Number(element.value);
      } else {
        data[element.name] = element.value;
      }
    });

    const urls = this.element.querySelectorAll('[name="url"]');
    const sources = this.element.querySelectorAll('[name="source"]');
    data.images = [];

    [...urls].forEach((item, i) => {
      data.images.push({
        url: item.value,
        source: sources[i].value
      });
    });

    if (this.productId) data.id = this.productId;

    return data;
  }

  onFormSubmit = async event => {
    event.preventDefault();

    const response = await fetchJson(this.url, {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(this.getFormElementsData())
    });

    let customEventName, customEventMessage;

    if (response) {
      customEventName = 'successful-form-confirmation';
      customEventMessage = this.productId ? 'product-updated' : 'product-saved';
    } else {
      customEventName = 'error-from-confirmation';
    }

    this.element.dispatchEvent(
      new CustomEvent(customEventName, {
        bubbles: true,
        detail: customEventMessage
      })
    );
  };

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
