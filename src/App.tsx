import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';

/** Keeps links from the original boots-only site working. */
function LegacyProductRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={slug ? `/shop/${slug}` : '/shop'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:slug" element={<ProductDetails />} />
        <Route path="/boots" element={<Navigate to="/shop?filter=footwear" replace />} />
        <Route path="/boots/:slug" element={<LegacyProductRedirect />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
