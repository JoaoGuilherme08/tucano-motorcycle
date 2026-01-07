import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Award, Headphones, Bike, CheckCircle, Truck, CreditCard, MessageCircle } from 'lucide-react';
import VehicleCard, { VehicleCardSkeleton } from '../components/VehicleCard';
import { vehicleService } from '../services/api';
import styles from './Home.module.css';

export default function Home() {
  const location = useLocation();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(100);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerRef = useRef(null);
  const homeRef = useRef(null);

  const banners = [
    '/banner1.jpeg',
    '/banner2.jpeg',
    '/banner3.jpeg',
    '/banner4.jpeg'
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await vehicleService.getFeatured();
        const data = Array.isArray(response.data) ? response.data : [];
        setFeaturedVehicles(data.slice(0, 6));
      } catch (error) {
        console.error('Erro ao carregar destaques:', error);
        setFeaturedVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // Scroll para seção quando há hash na URL
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      // Aguarda um pouco para garantir que o DOM está renderizado
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          const header = document.querySelector('header');
          const headerHeight = header ? header.getBoundingClientRect().height : 0;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerHeight - 20; // 20px de margem extra
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }, [location]);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header && bannerRef.current) {
        // Obtém a altura exata do header
        const rect = header.getBoundingClientRect();
        const height = Math.ceil(rect.height);
        
        // Aplica o margin-top exatamente igual à altura do header
        // Isso garante que a imagem comece EXATAMENTE onde o header termina
        bannerRef.current.style.marginTop = `${height}px`;
        bannerRef.current.style.top = '0';
        setHeaderHeight(height);
      }
    };

    // Atualiza imediatamente
    updateHeaderHeight();
    
    // Atualiza após o DOM estar carregado
    if (document.readyState === 'complete') {
      updateHeaderHeight();
    } else {
      window.addEventListener('load', updateHeaderHeight);
    }

    // Atualiza quando a janela é redimensionada ou o zoom muda
    const handleResize = () => {
      requestAnimationFrame(updateHeaderHeight);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Observa mudanças no header
    const header = document.querySelector('header');
    if (header) {
      const observer = new MutationObserver(() => {
        requestAnimationFrame(updateHeaderHeight);
      });
      observer.observe(header, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        childList: true,
        subtree: true
      });

      // Atualiza quando há scroll (header pode mudar de tamanho)
      const handleScroll = () => {
        requestAnimationFrame(updateHeaderHeight);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });

      // Verificação periódica como backup
      const intervalId = setInterval(updateHeaderHeight, 100);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('load', updateHeaderHeight);
        observer.disconnect();
      };
    }
  }, []);

  // Carrossel automático de banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Troca a cada 5 segundos

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div ref={homeRef} className={styles.home}>
      {/* Hero Banner - Fachada */}
      <section 
        ref={bannerRef}
        className={styles.heroBanner}
        style={{ marginTop: `${headerHeight}px` }}
      >
        <div className={styles.bannerImage}>
          {banners.map((banner, index) => (
            <motion.img
              key={banner}
              src={banner}
              alt="Fachada Tucano Motorcycle"
              className={styles.bannerImg}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: index === currentBannerIndex ? 1 : 0,
                scale: index === currentBannerIndex ? 1 : 1.05
              }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          ))}
        </div>
      </section>

      {/* Hero Content Section */}
      <section className={styles.heroContentSection}>
        <div className="container">
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className={styles.heroTitle}>
              Sua moto dos sonhos está <span className={styles.highlight}>aqui</span>
            </h1>
            <div className={styles.heroButtons}>
              <a 
                href="https://wa.me/5518996334805" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.heroButtonPrimary}
              >
                <MessageCircle size={20} />
                Falar no WhatsApp
                <ArrowRight size={18} />
              </a>
              <Link to="/veiculos" className={styles.heroButtonSecondary}>
                Ver Todo o Estoque
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className={styles.featured}>
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={styles.sectionTitle}>
              Motos em <span className={styles.highlight}>Destaque</span>
            </h2>
            <p className={styles.sectionDescription}>
              Seleção especial de motos premium cuidadosamente escolhidas
            </p>
          </motion.div>

          <div className={styles.vehiclesGrid}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <VehicleCardSkeleton key={i} />
              ))
            ) : featuredVehicles.length > 0 ? (
              featuredVehicles.map((vehicle, index) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
              ))
            ) : (
              <div className={styles.emptyState}>
                <Bike size={48} />
                <p>Nenhuma moto em destaque no momento</p>
                <Link to="/veiculos" className="btn btn-primary">
                  Ver todas as motos
                </Link>
              </div>
            )}
          </div>

          {featuredVehicles.length > 0 && (
            <motion.div
              className={styles.sectionCta}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/veiculos" className={styles.ctaButton}>
                Ver Todo o Estoque
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className={styles.about}>
        <div className="container">
          <motion.div
            className={styles.aboutContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.aboutTag}>Sobre a Tucano</div>
            <h2 className={styles.aboutTitle}>
              Especialistas em <span className={styles.highlight}>Harley-Davidson</span> e motos premium
            </h2>
            <div className={styles.aboutText}>
              <p>
                A <strong>Tucano Motorcycle</strong> nasceu da paixão genuína por motos e do compromisso 
                em oferecer as melhores experiências de compra. Com mais de uma década de experiência, 
                somos referência em motos premium, especialmente em <strong>Harley-Davidson</strong>.
              </p>
              <p>
                Trabalhamos apenas com as melhores marcas do mercado: Harley-Davidson, Honda, Yamaha, 
                Triumph, BMW e outras premium, sempre priorizando qualidade, segurança e satisfação 
                do cliente.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.ctaTitle}>
              Pronto para encontrar sua <span className={styles.highlight}>moto dos sonhos</span>?
            </h2>
            <p className={styles.ctaDescription}>
              Entre em contato conosco e descubra as melhores condições de financiamento. 
              Estamos prontos para ajudar você a realizar seu sonho sobre duas rodas.
            </p>
            <div className={styles.ctaButtons}>
              <a 
                href="https://wa.me/5518996334805" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.ctaPrimary}
              >
                <MessageCircle size={20} />
                Falar no WhatsApp
                <ArrowRight size={18} />
              </a>
              <Link to="/veiculos" className={styles.ctaSecondary}>
                Ver Todo o Estoque
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

