import { Route, Routes } from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import Home from './pages/Home';
import Boots from './pages/Boots';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/boots" element={<Boots />} />
        <Route path="/boots/:slug" element={<ProductDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
