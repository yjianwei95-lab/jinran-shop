import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: 'Home',
    component: () => import('./pages/Home.vue'),
    meta: { title: '首页', tab: true, icon: '🏠' },
  },
  {
    path: '/category',
    name: 'Category',
    component: () => import('./pages/Category.vue'),
    meta: { title: '分类', tab: true, icon: '📂' },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('./pages/Cart.vue'),
    meta: { title: '购物车', tab: true, icon: '🛒' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('./pages/Profile.vue'),
    meta: { title: '我的', tab: true, icon: '👤' },
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('./pages/ProductDetail.vue'),
    meta: { title: '商品详情' },
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('./pages/Checkout.vue'),
    meta: { title: '结算' },
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('./pages/Orders.vue'),
    meta: { title: '我的订单' },
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('./pages/OrderDetail.vue'),
    meta: { title: '订单详情' },
  },
  {
    path: '/address',
    name: 'Address',
    component: () => import('./pages/Address.vue'),
    meta: { title: '收货地址' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('./pages/Login.vue'),
    meta: { title: '登录' },
  },

  // === 个人中心子页面 ===
  {
    path: '/favorite',
    name: 'Favorite',
    component: () => import('./pages/Favorite.vue'),
    meta: { title: '我的收藏' },
  },
  {
    path: '/coupon',
    name: 'Coupon',
    component: () => import('./pages/Coupon.vue'),
    meta: { title: '优惠券' },
  },
  {
    path: '/points',
    name: 'Points',
    component: () => import('./pages/Points.vue'),
    meta: { title: '积分商城' },
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('./pages/History.vue'),
    meta: { title: '浏览记录' },
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('./pages/Feedback.vue'),
    meta: { title: '联系客服' },
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('./pages/About.vue'),
    meta: { title: '关于我们' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./pages/Settings.vue'),
    meta: { title: '设置' },
  },
  {
    path: '/profile-edit',
    name: 'ProfileEdit',
    component: () => import('./pages/ProfileEdit.vue'),
    meta: { title: '个人资料' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
