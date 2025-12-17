import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Bike, Plus, ListOrdered, Star, TrendingUp, ArrowRight } from 'lucide-react';
import { statsService } from '../services/api';
import styles from './Admin.module.css';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsService.get();
        setStats(response.data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      icon: <Bike size={28} />,
      label: 'Total de Motos',
      value: stats?.totalVehicles || 0,
      color: 'orange',
    },
    {
      icon: <Star size={28} />,
      label: 'Em Destaque',
      value: stats?.featuredCount || 0,
      color: 'yellow',
    },
    {
      icon: <TrendingUp size={28} />,
      label: 'Street/Naked',
      value: stats?.totalMotos || 0,
      color: 'purple',
    },
    {
      icon: <ListOrdered size={28} />,
      label: 'Trail/Adventure',
      value: stats?.totalCars || 0,
      color: 'blue',
    },
  ];

  const quickActions = [
    {
      icon: <Plus size={24} />,
      title: 'Nova Moto',
      description: 'Adicionar uma nova moto ao catálogo',
      link: '/admin/veiculos/novo',
      primary: true,
    },
    {
      icon: <ListOrdered size={24} />,
      title: 'Gerenciar Motos',
      description: 'Ver, editar ou remover motos',
      link: '/admin/veiculos',
    },
  ];

  return (
    <div className={styles.admin}>
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className={styles.title}>Painel Administrativo</h1>
            <p className={styles.subtitle}>Bem-vindo de volta! Gerencie suas motos.</p>
          </div>
          <Link to="/admin/veiculos/novo" className="btn btn-primary">
            <Plus size={20} />
            Nova Moto
          </Link>
        </motion.div>

        <div className={styles.stats}>
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`${styles.statCard} ${styles[stat.color]}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {loading ? '-' : stat.value}
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.quickActions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
          <div className={styles.actionsGrid}>
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className={`${styles.actionCard} ${action.primary ? styles.primary : ''}`}
              >
                <div className={styles.actionIcon}>{action.icon}</div>
                <div className={styles.actionInfo}>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <ArrowRight size={20} className={styles.actionArrow} />
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.tips}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className={styles.sectionTitle}>
            <TrendingUp size={20} />
            Dicas para Vender Mais
          </h2>
          <ul className={styles.tipsList}>
            <li>
              <span className={styles.tipNumber}>01</span>
              <div>
                <strong>Fotos de qualidade</strong>
                <p>Use fotos bem iluminadas e de vários ângulos da moto.</p>
              </div>
            </li>
            <li>
              <span className={styles.tipNumber}>02</span>
              <div>
                <strong>Descrição detalhada</strong>
                <p>Inclua informações sobre acessórios, revisões e manutenções.</p>
              </div>
            </li>
            <li>
              <span className={styles.tipNumber}>03</span>
              <div>
                <strong>Destaque as melhores</strong>
                <p>Marque como destaque as motos com melhor custo-benefício.</p>
              </div>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

