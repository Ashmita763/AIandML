import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

const ProductCarousel = () => {
  return (
    <div className="relative">
      <Carousel
        showArrows={true}
        showStatus={false}
        showThumbs={false}
        infiniteLoop={true}
        autoPlay={true}
        interval={3000}
        className="product-carousel"
      >
        <div>
          <img src="/images/carousel/slide1.jpg" alt="Product 1" />
          <p className="legend">Fresh Vegetables</p>
        </div>
        <div>
          <img src="/images/carousel/slide2.jpg" alt="Product 2" />
          <p className="legend">Organic Fruits</p>
        </div>
        <div>
          <img src="/images/carousel/slide3.jpg" alt="Product 3" />
          <p className="legend">Daily Essentials</p>
        </div>
      </Carousel>
    </div>
  );
};

export default ProductCarousel;
