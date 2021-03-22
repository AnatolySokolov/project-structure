import ProductForm from '../../../components/product-form';
import escapeHtml from '../../../utils/escape-html.js';
import fetchJson from '../../../utils/fetch-json.js';

export default class Page {
	element;
	subElements = {};
	components = {};

	constructor(productId) {
		this.productId = productId;
	}

	get template() {
		return `
			<div class="products-edit">

				<div class="content__top-panel">
					<h1 class="page-title">
						<a href="/products" class="link">Products</a>
							/ Add
					</h1>
				</div>

				<div data-element="productForm" class="content-box"></div>

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

    return [...elements].reduce( (acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  initComponents() {
  	const productForm = new ProductForm(this.productId);

  	this.components = { productForm };
  }

  async renderComponents() {
  	const form = await this.components.productForm.render();
  	const container = this.subElements.productForm;

  	container.append(form);
  }

  remove() {
  	this.element.remove();
  }

  destroy() {
  	this.remove();
  }
}