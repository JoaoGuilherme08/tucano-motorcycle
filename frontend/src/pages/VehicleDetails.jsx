import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Gauge, 
  MessageCircle, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  X,
  Share2,
  Heart,
  Bike
} from 'lucide-react';
import { vehicleService } from '../services/api';
import styles from './VehicleDetails.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '${API_BASE_URL}';

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [relatedVehicles, setRelatedVehicles] = useState([]);

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const response = await vehicleService.getById(id);
        setVehicle(response.data);

        // Buscar veículos relacionados (mesma categoria ou marca)
        const related = await vehicleService.getAll({ category: response.data.category });
        setRelatedVehicles(related.data.filter(v => v.id !== id).slice(0, 3));
      } catch (error) {
        console.error('Erro ao carregar veículo:', error);
        navigate('/veiculos');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, navigate]);

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

  const nextImage = () => {
    if (vehicle?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
    }
  };

  const prevImage = () => {
    if (vehicle?.images?.length) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? vehicle.images.length - 1 : prev - 1
      );
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vehicle?.model,
          text: `Confira esta ${vehicle?.model} na Tucano Motorcycle!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const whatsappMessage = vehicle 
    ? `Olá! Tenho interesse na moto ${vehicle.model} (${vehicle.year}) anunciada por ${formatPrice(vehicle.price)}. Gostaria de mais informações.`
    : '';

  const whatsappLink = `https://wa.me/5518996334805?text=${encodeURIComponent(whatsappMessage)}`;

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingContent}>
          <Bike size={48} className={styles.loadingIcon} />
          <p>Carregando veículo...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className={styles.notFound}>
        <h2>Veículo não encontrado</h2>
        <Link to="/veiculos" className="btn btn-primary">
          Ver todos os veículos
        </Link>
      </div>
    );
  }

  const images = vehicle.images || [];
  const currentImage = images[currentImageIndex];

  return (
    <div className={styles.details}>
      {/* Back Button */}
      <div className={`container ${styles.backWrapper}`}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Main Content */}
      <div className={`container ${styles.content}`}>
        <div className={styles.grid}>
          {/* Gallery */}
          <motion.div
            className={styles.gallery}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.mainImage}>
              {images.length > 0 ? (
                <>
                  <img
                    src={`${API_BASE_URL}/uploads/${currentImage.filename}`}
                    alt={vehicle.model}
                    onClick={() => setShowLightbox(true)}
                  />
                  {images.length > 1 && (
                    <>
                      <button 
                        className={`${styles.navBtn} ${styles.prevBtn}`}
                        onClick={prevImage}
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        className={`${styles.navBtn} ${styles.nextBtn}`}
                        onClick={nextImage}
                      >
                        <ChevronRight size={24} />
                      </button>
                      <div className={styles.imageCounter}>
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className={styles.noImage}>
                  <Bike size={64} />
                  <p>Sem imagens disponíveis</p>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    className={`${styles.thumbnail} ${
                      index === currentImageIndex ? styles.active : ''
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={`${API_BASE_URL}/uploads/${img.filename}`}
                      alt={`${vehicle.model} - Imagem ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            className={styles.info}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className={styles.infoHeader}>
          <div className={styles.typeBadge}>
            {vehicle.brand || 'Moto'}
          </div>
              {vehicle.featured === 1 && (
                <div className={styles.featuredBadge}>Destaque</div>
              )}
            </div>

            <h1 className={styles.model}>{vehicle.model}</h1>

            <div className={styles.specs}>
              <div className={styles.spec}>
                <Calendar size={20} />
                <div>
                  <span className={styles.specLabel}>Ano</span>
                  <span className={styles.specValue}>{vehicle.year}</span>
                </div>
              </div>
              <div className={styles.spec}>
                <Gauge size={20} />
                <div>
                  <span className={styles.specLabel}>Km</span>
                  <span className={styles.specValue}>{formatMileage(vehicle.mileage)}</span>
                </div>
              </div>
              <div className={styles.spec}>
                <Bike size={20} />
                <div>
                  <span className={styles.specLabel}>Categoria</span>
                  <span className={styles.specValue}>{vehicle.category || 'Custom'}</span>
                </div>
              </div>
            </div>

            <div className={styles.priceSection}>
              <span className={styles.priceLabel}>Valor</span>
              <span className={styles.price}>{formatPrice(vehicle.price)}</span>
            </div>

            {vehicle.description && (
              <div className={styles.description}>
                <h3>Descrição</h3>
                <p>{vehicle.description}</p>
              </div>
            )}

            <div className={styles.actions}>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <MessageCircle size={20} />
                Chamar no WhatsApp
              </a>
              <a href="tel:+5518996334805" className="btn btn-secondary">
                <Phone size={20} />
                Ligar
              </a>
            </div>

            <div className={styles.secondaryActions}>
              <button className={styles.iconBtn} onClick={handleShare}>
                <Share2 size={18} />
                <span>Compartilhar</span>
              </button>
              <button className={styles.iconBtn}>
                <Heart size={18} />
                <span>Favoritar</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related Vehicles */}
      {relatedVehicles.length > 0 && (
        <section className={styles.related}>
          <div className="container">
            <h2 className={styles.relatedTitle}>Veículos Similares</h2>
            <div className={styles.relatedGrid}>
              {relatedVehicles.map((v) => (
                <Link key={v.id} to={`/veiculo/${v.id}`} className={styles.relatedCard}>
                  <div className={styles.relatedImage}>
                    {v.images?.[0] ? (
                      <img
                        src={`${API_BASE_URL}/uploads/${v.images[0].filename}`}
                        alt={v.model}
                      />
                    ) : (
                      <div className={styles.relatedNoImage}>
                        <Bike size={32} />
                      </div>
                    )}
                  </div>
                  <div className={styles.relatedInfo}>
                    <h4>{v.model}</h4>
                    <p>{v.year} • {formatMileage(v.mileage)} km</p>
                    <span className={styles.relatedPrice}>{formatPrice(v.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLightbox(false)}
          >
            <button className={styles.lightboxClose} onClick={() => setShowLightbox(false)}>
              <X size={28} />
            </button>
            
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <img
                src={`${API_BASE_URL}/uploads/${currentImage?.filename}`}
                alt={vehicle.model}
              />
            </div>

            {images.length > 1 && (
              <>
                <button 
                  className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <div className={styles.lightboxCounter}>
              {currentImageIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

