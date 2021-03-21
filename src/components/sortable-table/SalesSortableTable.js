import SortableTable from './';

export default class SalesSortableTable extends SortableTable {
	getBodyTemplate(data) {
    return data
      .map(item => {
        return `
          <div class="sortable-table__row">
            ${this.getCellTemplate(item)}
          </div>
        `;
      })
      .join('');
  }
}
