import { Link } from 'react-router-dom';
import { Phone, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.topAccent}></div>
      
      <div className={`container ${styles.footerContent}`}>
        <div className={styles.mainSection}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <img 
                src="/tucanologo1.png" 
                alt="Tucano Motorcycle" 
                className={styles.logoImage}
              />
            </Link>
            <p className={styles.description}>
              Sua loja especializada em motos seminovas de qualidade. 
              Garantia de 3 meses de motor e câmbio em todas as motos.
            </p>
            <div className={styles.social}>
              <a href="https://www.instagram.com/tucano_motorcycle/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://wa.me/5518996334805" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="WhatsApp">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          <div className={styles.links}>
            <h4 className={styles.linksTitle}>Navegação</h4>
            <ul className={styles.linksList}>
              <li><Link to="/">Início</Link></li>
              <li><Link to="/veiculos">Todas as Motos</Link></li>
              <li><Link to="/eventos">Eventos</Link></li>
              <li><Link to="/veiculos?brand=Harley-Davidson">Harley-Davidson</Link></li>
            </ul>
          </div>

          <div className={styles.links}>
            <h4 className={styles.linksTitle}>Institucional</h4>
            <ul className={styles.linksList}>
              <li><a href="#">Sobre Nós</a></li>
              <li><a href="#">Financiamento</a></li>
              <li><a href="#">Política de Privacidade</a></li>
              <li><a href="#">Termos de Uso</a></li>
            </ul>
          </div>

          <div className={styles.contact}>
            <h4 className={styles.linksTitle}>Contato</h4>
            <ul className={styles.contactList}>
              <li>
                <Phone size={18} />
                <a href="https://wa.me/5518996334805" target="_blank" rel="noopener noreferrer">(18) 99633-4805</a>
              </li>
              <li>
                <MapPin size={18} />
                <span>Rua Aguapei, 1250<br />Araçatuba - SP, 16025-295</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} Tucano Motorcycle. Todos os direitos reservados.
          </p>
          <p className={styles.dev}>
            Desenvolvido com <span className={styles.heart}>♥</span> para você
          </p>
        </div>
      </div>
    </footer>
  );
}

