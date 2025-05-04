import React from "react";
import Banner from "../components/Banner";
import Product from "../pages/Product";

import Header from "../components/Header";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Banner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Products</h2>
        <Product />
      </div>
    </div>
  );
};

export default Home;
