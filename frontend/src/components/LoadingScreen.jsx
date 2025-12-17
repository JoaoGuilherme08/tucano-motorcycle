import { motion } from 'framer-motion';
import { Car } from 'lucide-react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen() {
  return (
    <div className={styles.container}>
      <motion.div
        className={styles.loader}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={styles.icon}
          animate={{ 
            rotate: [0, 10, -10, 0],
            y: [0, -5, 0]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Car size={48} />
        </motion.div>
        <motion.div
          className={styles.bar}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
        <p className={styles.text}>Carregando...</p>
      </motion.div>
    </div>
  );
}

