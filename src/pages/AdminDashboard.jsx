import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiLogOut, FiTrash2, FiXCircle } from 'react-icons/fi';
import {
  approveProduct,
  deleteAdminProduct,
  getAdminOrders,
  getAdminProducts,
  getAdminStats,
  getAdminUsers,
} from '../api/admin';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, productsData, usersData, ordersData] = await Promise.all([
        getAdminStats(),
        getAdminProducts(),
        getAdminUsers(),
        getAdminOrders(),
      ]);
      setStats(statsData);
      setProducts(productsData);
      setUsers(usersData);
      setOrders(ordersData);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login', { replace: true });
        return;
      }
      setError(err.response?.data?.message || 'Could not load admin data');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const updateProductStatus = async (id, isApproved) => {
    try {
      const updated = await approveProduct(id, isApproved);
      setProducts((current) => current.map((product) => (product.id === id ? updated : product)));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update product status');
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await deleteAdminProduct(id);
      setProducts((current) => current.filter((product) => product.id !== id));
      setStats((current) => current ? { ...current, totalProducts: Math.max(0, current.totalProducts - 1) } : current);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete product');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    navigate('/admin/login', { replace: true });
  };

  const statCards = [
    ['Farmers', stats?.totalUsers ?? '—'],
    ['Products', stats?.totalProducts ?? '—'],
    ['Orders', stats?.totalOrders ?? '—'],
    ['Completed sales', `₹${Number(stats?.totalSales || 0).toLocaleString('en-IN')}`],
  ];

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-gray-600">Manage live marketplace data</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 font-medium text-red-600"><FiLogOut /> Logout</button>
        </div>

        {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex gap-2">
          {['products', 'users', 'orders'].map((name) => (
            <button key={name} onClick={() => setTab(name)} className={`rounded-lg px-4 py-2 capitalize ${tab === name ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}>{name}</button>
          ))}
          <button onClick={loadDashboard} className="ml-auto rounded-lg bg-white px-4 py-2 text-gray-700">Refresh</button>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          {loading ? <p className="p-8 text-center text-gray-500">Loading...</p> : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>
                {tab === 'products' && <><th className="px-6 py-3 text-left text-xs uppercase">Product</th><th className="px-6 py-3 text-left text-xs uppercase">Seller</th><th className="px-6 py-3 text-left text-xs uppercase">Status</th><th className="px-6 py-3 text-left text-xs uppercase">Actions</th></>}
                {tab === 'users' && <><th className="px-6 py-3 text-left text-xs uppercase">Name</th><th className="px-6 py-3 text-left text-xs uppercase">Email</th><th className="px-6 py-3 text-left text-xs uppercase">Phone</th><th className="px-6 py-3 text-left text-xs uppercase">Joined</th></>}
                {tab === 'orders' && <><th className="px-6 py-3 text-left text-xs uppercase">Order</th><th className="px-6 py-3 text-left text-xs uppercase">Customer</th><th className="px-6 py-3 text-left text-xs uppercase">Amount</th><th className="px-6 py-3 text-left text-xs uppercase">Status</th></>}
              </tr></thead>
              <tbody className="divide-y divide-gray-200">
                {tab === 'products' && products.map((product) => <tr key={product.id}>
                  <td className="px-6 py-4"><div className="font-medium">{product.name}</div><div className="text-sm text-gray-500">₹{Number(product.price).toLocaleString('en-IN')}</div></td>
                  <td className="px-6 py-4">{product.seller_name}</td><td className="px-6 py-4 capitalize">{product.status}</td>
                  <td className="px-6 py-4"><div className="flex gap-3"><button title="Approve" onClick={() => updateProductStatus(product.id, true)} className="text-green-600"><FiCheckCircle /></button><button title="Reject" onClick={() => updateProductStatus(product.id, false)} className="text-orange-600"><FiXCircle /></button><button title="Delete" onClick={() => removeProduct(product.id)} className="text-red-600"><FiTrash2 /></button></div></td>
                </tr>)}
                {tab === 'users' && users.map((user) => <tr key={user.id}><td className="px-6 py-4">{user.name}</td><td className="px-6 py-4">{user.email}</td><td className="px-6 py-4">{user.phone || '—'}</td><td className="px-6 py-4">{formatDate(user.created_at)}</td></tr>)}
                {tab === 'orders' && orders.map((order) => <tr key={order.id}><td className="px-6 py-4">#{order.id}</td><td className="px-6 py-4">{order.user_name}<div className="text-sm text-gray-500">{order.user_email}</div></td><td className="px-6 py-4">₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</td><td className="px-6 py-4 capitalize">{order.status}</td></tr>)}
              </tbody>
            </table>
          )}
          {!loading && ((tab === 'products' && products.length === 0) || (tab === 'users' && users.length === 0) || (tab === 'orders' && orders.length === 0)) && <p className="p-8 text-center text-gray-500">No {tab} found.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
