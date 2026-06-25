// 后端API地址 - 可在APP设置页面修改
// 默认指向本地服务器 localhost:3001，部署后需修改
const BASE_URL = localStorage.getItem('api_base_url') || 'http://192.168.1.155:3001'

async function request(path, options = {}) {
  const url = BASE_URL + path
  const token = localStorage.getItem('token') || ''

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...options.headers,
    },
    ...options,
  })
  return res.json()
}

export const api = {
  // 商品
  getProducts(category, search) {
    let query = '/api/v1/products'
    const params = []
    if (category && category !== 'all') params.push('category=' + category)
    if (search) params.push('search=' + encodeURIComponent(search))
    if (params.length) query += '?' + params.join('&')
    return request(query)
  },
  getFeatured() { return request('/api/v1/products/featured') },
  getProduct(id) { return request('/api/v1/products/' + id) },
  getCategories() { return request('/api/v1/categories') },

  // 用户
  login(username, password) {
    return request('/api/v1/user/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },
  register(data) {
    return request('/api/v1/user/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  getUserInfo() { return request('/api/v1/user/info') },
  updateProfile(data) {
    return request('/api/v1/user/update', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 购物车
  getCart() { return request('/api/v1/cart') },
  addToCart(productId, quantity) {
    return request('/api/v1/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    })
  },
  updateCart(itemId, quantity) {
    return request('/api/v1/cart/update', {
      method: 'POST',
      body: JSON.stringify({ id: itemId, quantity }),
    })
  },
  removeFromCart(itemId) {
    return request('/api/v1/cart/remove', {
      method: 'POST',
      body: JSON.stringify({ id: itemId }),
    })
  },

  // 订单
  createOrder(data) {
    return request('/api/v1/order/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  getOrders() { return request('/api/v1/orders') },
  getOrder(id) { return request('/api/v1/order/' + id) },

  // 收藏
  getFavorites() { return request('/api/v1/favorites') },
  addFavorite(productId) {
    return request('/api/v1/favorites/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    })
  },
  removeFavorite(productId) {
    return request('/api/v1/favorites/remove', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    })
  },

  // 地址
  getAddresses() { return request('/api/v1/addresses') },
  saveAddress(data) {
    return request('/api/v1/address/save', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  deleteAddress(id) {
    return request('/api/v1/address/delete', {
      method: 'POST',
      body: JSON.stringify({ id }),
    })
  },
}
