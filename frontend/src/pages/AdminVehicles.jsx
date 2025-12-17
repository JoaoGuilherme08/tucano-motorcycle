import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Bike, 
  Eye, 
  Star, 
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { vehicleService } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '${API_BASE_URL}';
import styles from './AdminVehicles.module.css';

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, vehicle: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleService.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.vehicle) return;
    
    setDeleting(true);
    try {
      await vehicleService.delete(deleteModal.vehicle.id);
      setVehicles(prev => prev.filter(v => v.id !== deleteModal.vehicle.id));
      setDeleteModal({ show: false, vehicle: null });
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
    } finally {
      setDeleting(false);
    }
  };

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

  const filteredVehicles = vehicles.filter(v => 
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.adminVehicles}>
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className={styles.title}>Gerenciar Motos</h1>
            <p className={styles.subtitle}>{vehicles.length} moto{vehicles.length !== 1 ? 's' : ''} cadastrada{vehicles.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/admin/veiculos/novo" className="btn btn-primary">
            <Plus size={20} />
            Nova Moto
          </Link>
        </motion.div>

        <motion.div
          className={styles.toolbar}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className={styles.searchWrapper}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando veículos...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <motion.div
            className={styles.empty}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Bike size={64} />
            <h3>Nenhuma moto encontrada</h3>
            <p>
              {searchTerm 
                ? 'Tente buscar por outro termo' 
                : 'Comece adicionando sua primeira moto'}
            </p>
            {!searchTerm && (
              <Link to="/admin/veiculos/novo" className="btn btn-primary">
                <Plus size={20} />
                Adicionar Moto
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            className={styles.tableWrapper}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Veículo</th>
                  <th>Ano</th>
                  <th>Km</th>
                  <th>Preço</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle, index) => {
                  const primaryImage = vehicle.images?.find(img => img.is_primary) || vehicle.images?.[0];
                  return (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td>
                        <div className={styles.vehicleCell}>
                          <div className={styles.vehicleImage}>
                            {primaryImage ? (
                              <img
                                src={`${API_BASE_URL}/uploads/${primaryImage.filename}`}
                                alt={vehicle.model}
                              />
                            ) : (
                              <Bike size={24} />
                            )}
                          </div>
                          <div className={styles.vehicleInfo}>
                            <span className={styles.vehicleModel}>{vehicle.model}</span>
                            <span className={styles.vehicleType}>
                              {vehicle.type === 'moto' ? 'Moto' : 'Carro'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>{vehicle.year}</td>
                      <td>{formatMileage(vehicle.mileage)} km</td>
                      <td className={styles.priceCell}>{formatPrice(vehicle.price)}</td>
                      <td>
                        {vehicle.featured === 1 ? (
                          <span className={`${styles.badge} ${styles.featured}`}>
                            <Star size={12} />
                            Destaque
                          </span>
                        ) : (
                          <span className={styles.badge}>Normal</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Link
                            to={`/veiculo/${vehicle.id}`}
                            className={styles.actionBtn}
                            title="Ver detalhes"
                            target="_blank"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            to={`/admin/veiculos/editar/${vehicle.id}`}
                            className={styles.actionBtn}
                            title="Editar"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            title="Excluir"
                            onClick={() => setDeleteModal({ show: true, vehicle })}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Mobile Cards */}
        <div className={styles.mobileCards}>
          {!loading && filteredVehicles.map((vehicle, index) => {
            const primaryImage = vehicle.images?.find(img => img.is_primary) || vehicle.images?.[0];
            return (
              <motion.div
                key={vehicle.id}
                className={styles.mobileCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={styles.mobileCardHeader}>
                  <div className={styles.mobileCardImage}>
                    {primaryImage ? (
                      <img
                        src={`${API_BASE_URL}/uploads/${primaryImage.filename}`}
                        alt={vehicle.model}
                      />
                    ) : (
                      <Bike size={32} />
                    )}
                  </div>
                  <div className={styles.mobileCardInfo}>
                    <h3>{vehicle.model}</h3>
                    <p>{vehicle.year} • {formatMileage(vehicle.mileage)} km</p>
                    <span className={styles.mobileCardPrice}>{formatPrice(vehicle.price)}</span>
                  </div>
                </div>
                <div className={styles.mobileCardActions}>
                  <Link to={`/veiculo/${vehicle.id}`} className="btn btn-ghost" target="_blank">
                    <Eye size={16} />
                    Ver
                  </Link>
                  <Link to={`/admin/veiculos/editar/${vehicle.id}`} className="btn btn-ghost">
                    <Edit size={16} />
                    Editar
                  </Link>
                  <button
                    className="btn btn-ghost"
                    style={{ color: '#ff3b30' }}
                    onClick={() => setDeleteModal({ show: true, vehicle })}
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModal({ show: false, vehicle: null })}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalIcon}>
                <AlertTriangle size={32} />
              </div>
              <h3>Excluir moto</h3>
              <p>
                Tem certeza que deseja excluir <strong>{deleteModal.vehicle?.model}</strong>? 
                Esta ação não pode ser desfeita.
              </p>
              <div className={styles.modalActions}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteModal({ show: false, vehicle: null })}
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button
                  className={`btn ${styles.deleteConfirmBtn}`}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

