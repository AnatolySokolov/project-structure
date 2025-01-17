import getFormattedNumber from '../../utils/getFormattedNumber.js';

const header = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => {
      return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0].url}">
          </div>
        `;
    }
  },
  {
    id: 'title',
    title: 'Name',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'subcategory',
    title: 'Category',
    sortable: false,
    template: category => `<div class="sortable-table__cell">${category.title}</div>`
  },
  {
    id: 'quantity',
    title: 'Quantity',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'price',
    title: 'Price',
    sortable: true,
    sortType: 'number',
    template: price => `<div class="sortable-table__cell">$${getFormattedNumber(price, ',')}</div>`
  },
  {
    id: 'sales',
    title: 'Sales',
    sortable: true,
    sortType: 'number'
  }
];

export default header;
