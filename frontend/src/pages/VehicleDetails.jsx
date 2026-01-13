import { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  X,
  Share2,
  Bike,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { vehicleService } from '../services/api';
import { getImageUrl } from '../utils/imageUtils';
import styles from './VehicleDetails.module.css';

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [relatedVehicles, setRelatedVehicles] = useState([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const descriptionRef = useRef(null);

  useEffect(() => {
    // Scroll para o topo ao carregar a página
    window.scrollTo(0, 0);
    
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const response = await vehicleService.getById(id);
        setVehicle(response.data);

        // Buscar veículos relacionados (mesma categoria ou marca, excluindo vendidas)
        const related = await vehicleService.getAll({ category: response.data.category, sold: 'false' });
        setRelatedVehicles(related.data.filter(v => v.id !== id && v.sold !== 1).slice(0, 3));
      } catch (error) {
        console.error('Erro ao carregar veículo:', error);
        navigate('/veiculos');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, navigate]);

  // Verificar se a descrição precisa do botão de expandir
  useEffect(() => {
    if (vehicle?.description) {
      // Verificar se o texto é longo o suficiente para precisar de truncamento
      const charCount = vehicle.description.length;
      const lineCount = vehicle.description.split('\n').length;
      const isLongText = charCount > 150 || lineCount > 3;
      
      setShowExpandButton(isLongText);
      
      // Verificação adicional após renderização para garantir
      const checkTruncation = () => {
        if (descriptionRef.current && !isDescriptionExpanded) {
          const element = descriptionRef.current;
          const isTextTruncated = element.scrollHeight > element.clientHeight + 10; // Margem de erro
          if (isTextTruncated) {
            setShowExpandButton(true);
          }
        }
      };
      
      // Verificar após um pequeno delay para garantir que o DOM foi atualizado
      const timeoutId = setTimeout(checkTruncation, 200);
      return () => clearTimeout(timeoutId);
    } else {
      setShowExpandButton(false);
    }
  }, [vehicle?.description, isDescriptionExpanded]);

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
        // Compartilhamento cancelado pelo usuário
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const whatsappMessage = vehicle 
    ? vehicle.sold === 1
      ? `Olá! Gostaria de mais informações sobre motos disponíveis.`
      : `Olá! Tenho interesse na moto ${vehicle.model} (${vehicle.year}) anunciada por ${formatPrice(vehicle.price)}. Gostaria de mais informações.`
    : '';

  const whatsappLink = `https://wa.me/5518996334805?text=${encodeURIComponent(whatsappMessage)}`;
  const storeAddress = 'Rua Aguapei, 1250, Araçatuba - SP, 16025-295';
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeAddress)}`;

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
                    src={getImageUrl(currentImage.filename)}
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
                      src={getImageUrl(img.filename)}
                      alt={`${vehicle.model} - Imagem ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Descrição abaixo das fotos */}
            {vehicle.description && (
              <motion.div
                className={styles.description}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3>Descrição</h3>
                <div className={styles.descriptionContent}>
                  <p 
                    ref={descriptionRef}
                    className={isDescriptionExpanded ? styles.expanded : styles.collapsed}
                  >
                    {vehicle.description}
                  </p>
                  {(showExpandButton || (vehicle.description && (vehicle.description.length > 150 || vehicle.description.split('\n').length > 3))) && (
                    <button
                      className={styles.expandBtn}
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    >
                      {isDescriptionExpanded ? 'Mostrar menos' : 'Leia a descrição completa'}
                      {isDescriptionExpanded ? (
                        <ChevronDown size={16} className={styles.expandIcon} />
                      ) : (
                        <ChevronRight size={16} className={styles.expandIcon} />
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
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
              {vehicle.sold === 1 && (
                <div className={styles.soldBadge}>
                  <CheckCircle size={16} />
                  <span>Vendida</span>
                </div>
              )}
              {vehicle.featured === 1 && !vehicle.sold && (
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

            {vehicle.sold !== 1 && (
            <div className={styles.priceSection}>
              <span className={styles.priceLabel}>Valor</span>
              <span className={styles.price}>{formatPrice(vehicle.price)}</span>
            </div>
            )}

            {vehicle.sold === 1 && (
              <div className={styles.soldSection}>
                <CheckCircle size={24} />
                <div>
                  <span className={styles.soldLabel}>Status</span>
                  <span className={styles.soldValue}>Vendida</span>
                </div>
              </div>
            )}

            {vehicle.sold !== 1 && (
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
                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  <MapPin size={20} />
                  Localização
                </a>
            </div>
            )}

            <div className={styles.secondaryActions}>
              <button className={styles.iconBtn} onClick={handleShare}>
                <Share2 size={18} />
                <span>Compartilhar</span>
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
                        src={getImageUrl(v.images[0].filename)}
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
                    {v.sold !== 1 ? (
                    <span className={styles.relatedPrice}>{formatPrice(v.price)}</span>
                    ) : (
                      <span className={styles.relatedSold}>Vendida</span>
                    )}
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
                src={getImageUrl(currentImage?.filename)}
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

