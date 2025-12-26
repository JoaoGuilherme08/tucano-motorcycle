import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import VehicleCard, { VehicleCardSkeleton } from '../components/VehicleCard';
import { vehicleService } from '../services/api';
import styles from './SoldVehicles.module.css';

export default function SoldVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchSoldVehicles();
  }, []);

  const fetchSoldVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleService.getAll({ sold: 'true' });
      const data = Array.isArray(response.data) ? response.data : [];
      setVehicles(data);
    } catch (error) {
      console.error('Erro ao carregar motos vendidas:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className="container">
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </Link>
          
          <motion.div
            className={styles.headerContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.iconWrapper}>
              <CheckCircle size={48} />
            </div>
            <h1 className={styles.title}>
              Motos <span className="text-gradient">Vendidas</span>
            </h1>
            <p className={styles.subtitle}>
              Confira nosso histórico de vendas. Todas essas motos foram entregues com sucesso aos nossos clientes.
            </p>
          </motion.div>
        </div>
      </div>

      <div className={styles.content}>
        <div className="container">
          {loading ? (
            <div className={styles.grid}>
              {[...Array(6)].map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <motion.div
              className={styles.empty}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle size={64} />
              <h2>Nenhuma moto vendida ainda</h2>
              <p>Quando uma moto for marcada como vendida, ela aparecerá aqui.</p>
              <Link to="/veiculos" className="btn btn-primary">
                Ver Motos Disponíveis
              </Link>
            </motion.div>
          ) : (
            <>
              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{vehicles.length}</span>
                  <span className={styles.statLabel}>Motos Vendidas</span>
                </div>
              </div>
              
              <div className={styles.grid}>
                {vehicles.map((vehicle, index) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

