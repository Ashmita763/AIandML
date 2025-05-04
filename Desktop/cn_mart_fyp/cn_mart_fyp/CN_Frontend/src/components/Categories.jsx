import React from 'react';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { FaFilter, FaSearch, FaSortAmountDown } from "react-icons/fa";

const Categories = ({ onFilter, onSearch, onSort }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [priceRange, setPriceRange] = React.useState([0, 5000]);
  const categories = [
    "All",
    "Vegetables",
    "Fruits",
    "Dairy",
    "meat",
    "Beverages",
    "Snacks",
    "Household",
    "others",
  ];

  const sortOptions = [
    { name: "Most Popular", value: "popular" },
    { name: "Newest", value: "newest" },
    { name: "Price: Low to High", value: "price-low" },
    { name: "Price: High to Low", value: "price-high" },
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onFilter({ category, priceRange });
  };

  const handlePriceChange = (e) => {
    const newRange = [...priceRange];
    newRange[e.target.name === "min" ? 0 : 1] = Number(e.target.value);
    setPriceRange(newRange);
    onFilter({ category: selectedCategory, priceRange: newRange });
  };

  return (
    <div className="bg-white shadow-md py-6 mt-16">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Categories */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaFilter className="text-green-600" />
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${
                      selectedCategory === category
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Price Range</h3>
            <div className="flex items-center gap-4">
              <input
                type="number"
                name="min"
                value={priceRange[0]}
                onChange={handlePriceChange}
                className="w-24 px-2 py-1 border rounded"
                placeholder="Min"
              />
              <span>to</span>
              <input
                type="number"
                name="max"
                value={priceRange[1]}
                onChange={handlePriceChange}
                className="w-24 px-2 py-1 border rounded"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaSortAmountDown className="text-green-600" />
              Sort By
            </h3>
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                Sort by
                <ChevronDownIcon className="h-5 w-5" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border">
                {sortOptions.map((option) => (
                  <Menu.Item key={option.value}>
                    {({ active }) => (
                      <button
                        onClick={() => onSort(option.value)}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } w-full text-left px-4 py-2 text-sm`}
                      >
                        {option.name}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
