import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gauge, Calendar, ArrowRight, Star, CheckCircle } from 'lucide-react';
import { getImageUrl } from '../utils/imageUtils';
import styles from './VehicleCard.module.css';

export default function VehicleCard({ vehicle, index = 0 }) {
  const primaryImage = vehicle.images?.find(img => img.is_primary) || vehicle.images?.[0];
  // Usar a URL já processada pelo backend (que vem como /api/images/...)
  // getImageUrl vai converter para URL completa se necessário
  const imageUrl = primaryImage?.url ? getImageUrl(primaryImage.url) : (primaryImage ? getImageUrl(primaryImage.filename) : '/placeholder-moto.jpg');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('pt-BR').format(mileage);
  };

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={vehicle.sold !== 1 ? { y: -8 } : {}}
    >
      <Link 
        to={vehicle.sold === 1 ? '#' : `/veiculo/${vehicle.id}`} 
        className={styles.cardLink}
        onClick={vehicle.sold === 1 ? (e) => e.preventDefault() : undefined}
        style={vehicle.sold === 1 ? { cursor: 'default', opacity: 0.8 } : {}}
      >
        <div className={styles.imageWrapper}>
          <img
            src={imageUrl}
            alt={vehicle.model}
            className={styles.image}
            loading="lazy"
          />
          <div className={styles.imageOverlay}></div>
          
          {vehicle.sold === 1 && (
            <div className={styles.soldBadge}>
              <CheckCircle size={16} />
              <span>Vendida</span>
            </div>
          )}
          
          {vehicle.featured === 1 && !vehicle.sold && (
            <div className={styles.featuredBadge}>
              <Star size={12} />
              <span>Destaque</span>
            </div>
          )}
          
          <div className={styles.typeBadge}>
            {vehicle.brand || 'Moto'}
          </div>
        </div>

        <div className={styles.content}>
          <h3 className={styles.model}>{vehicle.model}</h3>
          
          <div className={styles.specs}>
            <div className={styles.spec}>
              <Calendar size={16} />
              <span>{vehicle.year}</span>
            </div>
            <div className={styles.spec}>
              <Gauge size={16} />
              <span>{formatMileage(vehicle.mileage)} km</span>
            </div>
          </div>

          <div className={styles.footer}>
            {vehicle.sold !== 1 && (
            <div className={styles.price}>
              <span className={styles.priceLabel}>Preço</span>
              <span className={styles.priceValue}>{formatPrice(vehicle.price)}</span>
            </div>
            )}
            
            {vehicle.sold === 1 ? (
              <div className={styles.soldMessage}>
                <CheckCircle size={18} />
                <span>Vendida</span>
              </div>
            ) : (
            <div className={styles.cta}>
              <span>Ver detalhes</span>
              <ArrowRight size={18} />
            </div>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.content}>
        <div className={`${styles.skeletonText} ${styles.skeletonTitle}`}></div>
        <div className={styles.specs}>
          <div className={`${styles.skeletonText} ${styles.skeletonSpec}`}></div>
          <div className={`${styles.skeletonText} ${styles.skeletonSpec}`}></div>
        </div>
        <div className={styles.footer}>
          <div className={`${styles.skeletonText} ${styles.skeletonPrice}`}></div>
          <div className={`${styles.skeletonText} ${styles.skeletonBtn}`}></div>
        </div>
      </div>
    </div>
  );
}

