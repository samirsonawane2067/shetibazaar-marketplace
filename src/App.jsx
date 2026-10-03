import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SellProduct from './pages/SellProduct';
import MyProducts from './pages/MyProducts';
import LaunchProduct from './pages/LaunchProduct';
import Launches from './pages/Launches';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    {/* Public Home page */}
                    <Route path="/" element={<Home />} />

                    {/* Auth pages */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />

                    {/* Public product & shopping routes */}
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/launches" element={<Launches />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />

                    {/* Buy product checkout - Protected */}
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute message="Please login or register to complete your purchase.">
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />

                    {/* Sell product routes - Protected */}
                    <Route
                      path="/sell-product"
                      element={
                        <ProtectedRoute message="Please login or register to list and sell your products.">
                          <SellProduct />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-products"
                      element={
                        <ProtectedRoute message="Please login or register to manage your products.">
                          <MyProducts />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/launch-product"
                      element={
                        <ProtectedRoute message="Please login or register to launch new products.">
                          <LaunchProduct />
                        </ProtectedRoute>
                      }
                    />

                    {/* Account routes - Protected */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute message="Please login or register to view your dashboard.">
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute message="Please login or register to view your profile.">
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
