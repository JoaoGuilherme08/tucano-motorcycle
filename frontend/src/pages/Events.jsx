import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users } from 'lucide-react';
import styles from './Events.module.css';

export default function Events() {
  const instagramPosts = [
    {
      id: 1,
      url: 'https://www.instagram.com/p/DR96gj9j109/',
      embedUrl: 'https://www.instagram.com/p/DR96gj9j109/embed',
      title: 'Evento Tucano Motorcycle',
    },
    {
      id: 2,
      url: 'https://www.instagram.com/p/DR7auDojm5Y/',
      embedUrl: 'https://www.instagram.com/p/DR7auDojm5Y/embed',
      title: 'Encontro de Motociclistas',
    },
    {
      id: 3,
      url: 'https://www.instagram.com/p/DHWN9ZoPyCL/',
      embedUrl: 'https://www.instagram.com/p/DHWN9ZoPyCL/embed',
      title: 'Passeio em Grupo',
    },
  ];

  useEffect(() => {
    // Carregar script do Instagram para embeds
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={styles.events}>
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
              Nossos <span className="text-gradient">Eventos</span>
            </h1>
            <p className={styles.subtitle}>
              Confira os melhores momentos da família Tucano Motorcycle
            </p>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className={styles.infoSection}>
        <div className="container">
          <motion.div
            className={styles.infoGrid}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Calendar size={32} />
              </div>
              <h3>Eventos Regulares</h3>
              <p>Organizamos encontros e passeios para a comunidade motociclista</p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Users size={32} />
              </div>
              <h3>Comunidade</h3>
              <p>Faça parte da família Tucano e conheça outros apaixonados por motos</p>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <MapPin size={32} />
              </div>
              <h3>Araçatuba e Região</h3>
              <p>Passeios incríveis pela região com destinos surpreendentes</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Instagram Posts */}
      <section className={styles.postsSection}>
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={styles.sectionTitle}>
              Momentos <span className="text-gradient">Especiais</span>
            </h2>
            <p className={styles.sectionDescription}>
              Acompanhe nossos eventos pelo Instagram
            </p>
          </motion.div>

          <div className={styles.postsGrid}>
            {instagramPosts.map((post, index) => (
              <motion.div
                key={post.id}
                className={styles.postCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={styles.postEmbed}>
                  <iframe
                    src={post.embedUrl}
                    title={post.title}
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency="true"
                    allowFullScreen
                  ></iframe>
                </div>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.postLink}
                >
                  Ver no Instagram
                </a>
              </motion.div>
            ))}
          </div>
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
              Quer participar dos nossos <span className="text-gradient">eventos</span>?
            </h2>
            <p className={styles.ctaDescription}>
              Siga nosso Instagram para ficar por dentro de todos os passeios e encontros!
            </p>
            <div className={styles.ctaButtons}>
              <a
                href="https://www.instagram.com/tucano_motorcycle/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Seguir no Instagram
              </a>
              <a
                href="https://wa.me/5518996334805"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Falar no WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

