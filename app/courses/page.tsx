'use client';

import React, { useState, useEffect } from 'react';
import { CourseCard } from '../../components/CourseCard';
import { Course, Category } from '../../types';
import { api } from '../../services/api';
import { Search, Filter, SlidersHorizontal, BookOpen, Layers } from 'lucide-react';

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/courses/categories');
        if (res.data.success) setCategories(res.data.data);
      } catch (e) {}
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await api.get('/courses', {
          params: {
            search,
            category: selectedCategory,
            level: selectedLevel,
            price: selectedPrice,
            sort: sortBy,
          },
        });
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedLevel, selectedPrice, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Banner */}
      <div className="space-y-3 border-b border-brand-border/60 pb-6">
        <span className="text-brand-green font-mono text-xs font-bold uppercase tracking-widest">
          ECU FORGE TECHNICAL CURRICULUM
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white uppercase font-sans">
          Masterclass Catalog
        </h1>
        <p className="text-sm text-brand-silver max-w-2xl">
          Browse comprehensive automotive diagnostic & ECU remapping masterclasses engineered by MECH-MOTO specialists.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-6 rounded-2xl bg-brand-surface border border-brand-border space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-brand-silver absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search masterclasses (e.g., Bosch MED17, CAN-Bus, EV Safety)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-green transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-brand-green" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-auto px-4 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm font-mono focus:outline-none focus:border-brand-green"
            >
              <option value="featured">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills & Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-brand-border/40">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              selectedCategory === ''
                ? 'bg-brand-green text-black'
                : 'bg-brand-dark border border-brand-border text-brand-silver hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-green text-black'
                  : 'bg-brand-dark border border-brand-border text-brand-silver hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-3">
            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-brand-dark border border-brand-border text-white text-xs font-mono"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Master">Master</option>
            </select>

            {/* Price Filter */}
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-brand-dark border border-brand-border text-white text-xs font-mono"
            >
              <option value="">All Prices</option>
              <option value="free">Free Courses</option>
              <option value="paid">Paid Masterclasses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-brand-surface animate-pulse"></div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-3xl bg-brand-surface border border-brand-border text-center space-y-4">
          <BookOpen className="w-12 h-12 text-brand-silver mx-auto opacity-50" />
          <h3 className="text-xl font-bold text-white">No Masterclasses Found</h3>
          <p className="text-sm text-brand-silver max-w-md mx-auto">
            Try adjusting your search query or removing category/level filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedLevel('');
              setSelectedPrice('');
            }}
            className="px-4 py-2 rounded-xl bg-brand-green text-black font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
