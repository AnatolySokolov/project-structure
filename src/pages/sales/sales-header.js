import getFormattedNumber from '../../utils/getFormattedNumber.js';

const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'Name',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    sortType: 'date',
    template: value => {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'June',
        'July',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];
      const date = new Date(value);

      return `
        <div class="sortable-table__cell">
          ${months[date.getMonth()]}
          ${date.getDate()}
          , ${date.getFullYear()}
        </div>
      `;
    }
  },
  {
    id: 'totalCost',
    title: 'Price',
    sortable: true,
    sortType: 'number',
    template: price => `<div class="sortable-table__cell">$${getFormattedNumber(price, ',')}</div>`
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'number'
  }
];

export default header;
