import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Award, Headphones, Bike } from 'lucide-react';
import VehicleCard, { VehicleCardSkeleton } from '../components/VehicleCard';
import { vehicleService } from '../services/api';
import styles from './Home.module.css';

export default function Home() {
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const features = [
    {
      icon: <Shield size={32} />,
      title: 'Garantia de 3 Meses',
      description: 'Todas as motos com garantia de 3 meses de motor e câmbio.',
    },
    {
      icon: <Award size={32} />,
      title: 'Serviço Completo',
      description: 'Venda, Troca, Compra, Financiamento e Consignado em um só lugar.',
    },
    {
      icon: <Headphones size={32} />,
      title: 'Atendimento Personalizado',
      description: 'Suporte especializado via WhatsApp para tirar todas suas dúvidas.',
    },
  ];

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroBgOverlay}></div>
          <div className={styles.heroGlow}></div>
        </div>
        
        <div className={`container ${styles.heroContent}`}>
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className={styles.heroTitle}>
              A moto dos seus <span className="text-gradient">sonhos</span> está aqui
            </h1>
            <div className={styles.heroCta}>
              <Link to="/veiculos" className="btn btn-primary">
                <Bike size={20} />
                Ver Veículos
                <ArrowRight size={18} />
              </Link>
              <a href="#sobre" className="btn btn-secondary">
                Saiba Mais
              </a>
            </div>
          </motion.div>

          <motion.div
            className={styles.heroStats}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className={styles.stat}>
              <span className={styles.statValue}>5 em 1</span>
              <span className={styles.statLabel}>Venda • Troca • Compra • Financia • Consignado</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statValue}>100%</span>
              <span className={styles.statLabel}>Clientes Satisfeitos</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statValue}>3 meses</span>
              <span className={styles.statLabel}>Garantia Motor e Câmbio</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className={styles.heroScroll}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span>Rolar para baixo</span>
          <div className={styles.scrollIndicator}>
            <div className={styles.scrollDot}></div>
          </div>
        </motion.div>
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
            <div className={styles.sectionTag}>Destaques</div>
            <h2 className={styles.sectionTitle}>Motos em <span className="text-gradient">Destaque</span></h2>
            <p className={styles.sectionDescription}>
              Confira as motos mais procuradas do nosso estoque
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
              <Link to="/veiculos" className="btn btn-outline">
                Ver Todas as Motos
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className={styles.about}>
        <div className="container">
          <div className={styles.aboutGrid}>
            <motion.div
              className={styles.aboutContent}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className={styles.sectionTag}>Sobre Nós</div>
            <h2 className={styles.aboutTitle}>
              Especialistas em <span className="text-gradient">Harley-Davidson</span> e motos premium
            </h2>
            <p className={styles.aboutText}>
              A Tucano Motorcycle nasceu da paixão por motos e do compromisso em oferecer 
              as melhores experiências de compra. Somos especialistas em Harley-Davidson 
              e trabalhamos com as melhores marcas do mercado.
            </p>
            <p className={styles.aboutText}>
              Oferecemos serviços completos: <strong>Venda, Troca, Compra, Financiamento e Consignado</strong>. 
              Todas as motos passam por inspeção rigorosa e contam com garantia de 3 meses de motor e câmbio.
            </p>
              <div className={styles.aboutCta}>
                <a 
                  href="https://wa.me/5518996334805" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Fale Conosco
                  <ArrowRight size={18} />
                </a>
              </div>
            </motion.div>

            <motion.div
              className={styles.featuresGrid}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={styles.featureCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBackground}></div>
        <div className="container">
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.ctaTitle}>
              Encontrou a moto <span className="text-gradient">ideal</span>?
            </h2>
            <p className={styles.ctaDescription}>
              Entre em contato agora mesmo e faça uma proposta. 
              Trabalhamos com as melhores condições de financiamento.
            </p>
            <div className={styles.ctaButtons}>
              <a 
                href="https://wa.me/5518996334805" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                WhatsApp
                <ArrowRight size={18} />
              </a>
              <Link to="/veiculos" className="btn btn-secondary">
                Ver Estoque
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

