// utils/queryHelper.js

class QueryHelper {
  // Build WHERE clause from filters
  static buildWhereClause(filters) {
    const conditions = [];
    const values = [];

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        conditions.push(`${key} = ?`);
        values.push(value);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, values };
  }

  // Build pagination
  static buildPagination(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return { limit, offset, query: `LIMIT ? OFFSET ?`, values: [limit, offset] };
  }

  // Build ORDER BY clause
  static buildOrderBy(sortBy = 'id', order = 'ASC') {
    const validOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    return `ORDER BY ${sortBy} ${validOrder}`;
  }

  // Build LIKE search
  static buildSearch(field, searchTerm) {
    return {
      query: `${field} LIKE ?`,
      value: `%${searchTerm}%`
    };
  }
}

module.exports = QueryHelper;