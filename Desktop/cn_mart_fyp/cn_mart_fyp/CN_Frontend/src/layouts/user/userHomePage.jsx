import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Product from "../../pages/Product";

import api from "../../services/api";
import Banner from "../../components/Banner.jsx";


const UserHomePage = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    // Perform logout logic here (e.g., clear tokens, etc.)
    navigate("/"); // Redirect to home page
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/product/all");
      setProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Banner />
      <Product />
    </div>
  );
};

export default UserHomePage;
