
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHelmet from '../components/seo/SEOHelmet';
import { useSEO } from '../hooks/useSEO';
import { Button } from '@/components/ui/button';
import { ArrowRight, Palette, Shirt, Coffee } from 'lucide-react';

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const seoData = useSEO({
    title: 'B3F Prints - Custom Printing Services',
    description: 'Design and order custom printed products including t-shirts, mugs, caps and more. Professional quality printing with fast delivery.',
    keywords: 'custom printing, t-shirts, mugs, caps, design, personalized products'
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories = [
    {
      id: 'tshirts',
      name: 'T-Shirts',
      image: '/lovable-uploads/main-categorie/tshirt-print.png',
      icon: Shirt,
      description: 'Custom printed t-shirts'
    },
    {
      id: 'mugs',
      name: 'Mugs',
      image: '/lovable-uploads/main-categorie/mug-print.png',
      icon: Coffee,
      description: 'Personalized mugs'
    },
    {
      id: 'caps',
      name: 'Caps',
      image: '/lovable-uploads/main-categorie/cap-print.png',
      icon: Palette,
      description: 'Custom caps and hats'
    }
  ];

  return (
    <Layout>
      <SEOHelmet {...seoData} />
      
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className={`container mx-auto px-4 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Design Your Dreams
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Create custom printed products with our easy-to-use design tool
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/design-tool">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Designing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <IconComponent className="h-6 w-6 text-blue-600 mr-2" />
                      <h3 className="text-xl font-semibold">{category.name}</h3>
                    </div>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
