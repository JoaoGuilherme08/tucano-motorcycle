import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Car, ArrowUpDown, ChevronDown } from 'lucide-react';
import VehicleCard, { VehicleCardSkeleton } from '../components/VehicleCard';
import { vehicleService } from '../services/api';
import styles from './Vehicles.module.css';

export default function Vehicles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    model: searchParams.get('model') || '',
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    year: searchParams.get('year') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minMileage: searchParams.get('minMileage') || '',
    maxMileage: searchParams.get('maxMileage') || '',
    type: searchParams.get('type') || '',
    sort: searchParams.get('sort') || 'recent',
  });

  const brandOptions = [
    'Harley-Davidson',
    'Honda',
    'Yamaha',
    'Kawasaki',
    'Suzuki',
    'Triumph',
    'Royal Enfield',
    'BMW',
    'Ducati',
    'KTM',
    'Indian',
  ];

  const categoryOptions = [
    { value: 'street', label: 'Street (Urbanas)' },
    { value: 'naked', label: 'Naked (Esportivas)' },
    { value: 'esportiva', label: 'Esportivas (Alta Performance)' },
    { value: 'custom', label: 'Custom (Estilo Clássico)' },
    { value: 'scooter', label: 'Scooter (Automáticas)' },
    { value: 'trail', label: 'Trail/Big Trail (Aventura)' },
    { value: 'touring', label: 'Touring (Viagens Longas)' },
  ];

  useEffect(() => {
    fetchVehicles();
  }, [searchParams]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const response = await vehicleService.getAll(params);
      const data = Array.isArray(response.data) ? response.data : [];
      setVehicles(data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      model: '',
      brand: '',
      category: '',
      year: '',
      minPrice: '',
      maxPrice: '',
      minMileage: '',
      maxMileage: '',
      type: '',
      sort: 'recent',
    });
    setSearchParams(new URLSearchParams());
    setShowFilters(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const sortOptions = [
    { value: 'recent', label: 'Mais Recentes' },
    { value: 'price_asc', label: 'Menor Preço' },
    { value: 'price_desc', label: 'Maior Preço' },
    { value: 'year_desc', label: 'Ano (Novo → Antigo)' },
    { value: 'year_asc', label: 'Ano (Antigo → Novo)' },
  ];

  const yearOptions = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'sort'
  ).length;

  return (
    <div className={styles.vehicles}>
      {/* Header */}
      <section className={styles.header}>
        <div className={styles.headerBg}></div>
        <div className={`container ${styles.headerContent}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={styles.title}>
              Nossas <span className="text-gradient">Motos</span>
            </h1>
            <p className={styles.subtitle}>
              Encontre a moto perfeita para você
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className={styles.filtersBar}>
        <div className="container">
          <div className={styles.filtersBarContent}>
            <div className={styles.searchWrapper}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar por modelo..."
                className={styles.searchInput}
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>

            <div className={styles.filtersActions}>
              <div className={styles.sortWrapper}>
                <ArrowUpDown size={16} />
                <select
                  className={styles.sortSelect}
                  value={filters.sort}
                  onChange={(e) => {
                    handleFilterChange('sort', e.target.value);
                    const params = new URLSearchParams(searchParams);
                    params.set('sort', e.target.value);
                    setSearchParams(params);
                  }}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className={styles.sortArrow} />
              </div>

              <button
                className={`${styles.filterBtn} ${activeFiltersCount > 0 ? styles.active : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={18} />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className={styles.filterCount}>{activeFiltersCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className={styles.filtersPanel}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.filtersPanelContent}>
                  <div className={styles.filterGroup}>
                    <label>Marca</label>
                    <select
                      className="input select"
                      value={filters.brand}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                    >
                      <option value="">Todas as marcas</option>
                      {brandOptions.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.filterGroup}>
                    <label>Categoria</label>
                    <select
                      className="input select"
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="">Todas as categorias</option>
                      {categoryOptions.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.filterGroup}>
                    <label>Ano</label>
                    <select
                      className="input select"
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                    >
                      <option value="">Todos os anos</option>
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.filterGroup}>
                    <label>Faixa de Preço</label>
                    <div className={styles.rangeInputs}>
                      <input
                        type="number"
                        placeholder="Mín"
                        className="input"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      />
                      <span>até</span>
                      <input
                        type="number"
                        placeholder="Máx"
                        className="input"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.filterGroup}>
                    <label>Quilometragem</label>
                    <div className={styles.rangeInputs}>
                      <input
                        type="number"
                        placeholder="Mín"
                        className="input"
                        value={filters.minMileage}
                        onChange={(e) => handleFilterChange('minMileage', e.target.value)}
                      />
                      <span>até</span>
                      <input
                        type="number"
                        placeholder="Máx"
                        className="input"
                        value={filters.maxMileage}
                        onChange={(e) => handleFilterChange('maxMileage', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={styles.filtersButtons}>
                    <button className="btn btn-secondary" onClick={clearFilters}>
                      <X size={18} />
                      Limpar
                    </button>
                    <button className="btn btn-primary" onClick={applyFilters}>
                      Aplicar Filtros
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results */}
      <section className={styles.results}>
        <div className="container">
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              {loading ? 'Buscando...' : `${vehicles.length} moto${vehicles.length !== 1 ? 's' : ''} encontrada${vehicles.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <div className={styles.vehiclesGrid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))
            ) : vehicles.length > 0 ? (
              vehicles.map((vehicle, index) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
              ))
            ) : (
              <motion.div
                className={styles.emptyState}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Car size={64} />
                <h3>Nenhuma moto encontrada</h3>
                <p>Tente ajustar os filtros para encontrar mais resultados</p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  Limpar Filtros
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

