import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Save, 
  Eye, 
  Car, 
  ImagePlus,
  Star,
  Loader2
} from 'lucide-react';
import { vehicleService } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '${API_BASE_URL}';
import styles from './AdminVehicleForm.module.css';

export default function AdminVehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    model: '',
    brand: 'Harley-Davidson',
    category: 'custom',
    year: new Date().getFullYear(),
    mileage: '',
    price: '',
    description: '',
    type: 'moto',
    featured: false,
  });

  const brandOptions = [
    'Harley-Davidson',
    'Honda',
    'Yamaha',
    'Kawasaki',
    'Suzuki',
    'Triumph',
    'Royal Enfield',
    'BMW',
    'Ducati',
    'KTM',
    'Indian',
    'Outras',
  ];

  const categoryOptions = [
    { value: 'street', label: 'Street (Urbanas)' },
    { value: 'naked', label: 'Naked (Esportivas sem carenagem)' },
    { value: 'esportiva', label: 'Esportivas (Alta Performance)' },
    { value: 'custom', label: 'Custom (Estilo Clássico)' },
    { value: 'scooter', label: 'Scooter (Automáticas)' },
    { value: 'trail', label: 'Trail/Big Trail (Aventura)' },
    { value: 'touring', label: 'Touring (Viagens Longas)' },
  ];

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditing);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const response = await vehicleService.getById(id);
      const vehicle = response.data;
      setFormData({
        model: vehicle.model,
        brand: vehicle.brand || 'Harley-Davidson',
        category: vehicle.category || 'custom',
        year: vehicle.year,
        mileage: vehicle.mileage,
        price: vehicle.price,
        description: vehicle.description || '',
        type: vehicle.type || 'moto',
        featured: vehicle.featured === 1,
      });
      setExistingImages(vehicle.images || []);
    } catch (error) {
      console.error('Erro ao carregar veículo:', error);
      navigate('/admin/veiculos');
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeNewImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const removeExistingImage = (imageId) => {
    setImagesToRemove(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.model.trim()) newErrors.model = 'Modelo é obrigatório';
    if (!formData.year) newErrors.year = 'Ano é obrigatório';
    if (!formData.mileage) newErrors.mileage = 'Quilometragem é obrigatória';
    if (!formData.price) newErrors.price = 'Preço é obrigatório';
    if (!isEditing && images.length === 0) newErrors.images = 'Adicione pelo menos uma foto';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append('model', formData.model);
      data.append('brand', formData.brand);
      data.append('category', formData.category);
      data.append('year', formData.year);
      data.append('mileage', formData.mileage);
      data.append('price', formData.price);
      data.append('description', formData.description);
      data.append('type', formData.type);
      data.append('featured', formData.featured);

      images.forEach(img => {
        data.append('images', img.file);
      });

      if (isEditing && imagesToRemove.length > 0) {
        data.append('removeImages', JSON.stringify(imagesToRemove));
      }

      if (isEditing) {
        await vehicleService.update(id, data);
      } else {
        await vehicleService.create(data);
      }

      navigate('/admin/veiculos');
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      setErrors({ submit: 'Erro ao salvar moto. Tente novamente.' });
    } finally {
      setLoading(false);
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

  const yearOptions = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i + 1);

  const allImages = [
    ...existingImages.map(img => ({ 
      type: 'existing', 
      id: img.id, 
      url: `${API_BASE_URL}/uploads/${img.filename}` 
    })),
    ...images.map((img, i) => ({ 
      type: 'new', 
      index: i, 
      url: img.preview 
    })),
  ];

  if (fetchingData) {
    return (
      <div className={styles.loading}>
        <Loader2 size={40} className={styles.spinner} />
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={styles.formPage}>
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.title}>
              {isEditing ? 'Editar Moto' : 'Nova Moto'}
            </h1>
            <p className={styles.subtitle}>
              {isEditing ? 'Atualize as informações da moto' : 'Preencha os dados da moto'}
            </p>
          </div>
        </motion.div>

        <div className={styles.content}>
          <motion.form
            className={styles.form}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Marca */}
            <div className={styles.fieldGroup}>
              <label htmlFor="brand">Marca *</label>
              <select
                id="brand"
                name="brand"
                className="input select"
                value={formData.brand}
                onChange={handleChange}
              >
                {brandOptions.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Categoria */}
            <div className={styles.fieldGroup}>
              <label htmlFor="category">Categoria *</label>
              <select
                id="category"
                name="category"
                className="input select"
                value={formData.category}
                onChange={handleChange}
              >
                {categoryOptions.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Modelo */}
            <div className={`${styles.fieldGroup} ${errors.model ? styles.error : ''}`}>
              <label htmlFor="model">Modelo *</label>
              <input
                type="text"
                id="model"
                name="model"
                className="input"
                placeholder="Ex: Honda CB 500F ABS"
                value={formData.model}
                onChange={handleChange}
              />
              {errors.model && <span className={styles.errorMsg}>{errors.model}</span>}
            </div>

            {/* Ano e Quilometragem */}
            <div className={styles.row}>
              <div className={`${styles.fieldGroup} ${errors.year ? styles.error : ''}`}>
                <label htmlFor="year">Ano *</label>
                <select
                  id="year"
                  name="year"
                  className="input select"
                  value={formData.year}
                  onChange={handleChange}
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.year && <span className={styles.errorMsg}>{errors.year}</span>}
              </div>

              <div className={`${styles.fieldGroup} ${errors.mileage ? styles.error : ''}`}>
                <label htmlFor="mileage">Quilometragem *</label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  className="input"
                  placeholder="Ex: 45000"
                  value={formData.mileage}
                  onChange={handleChange}
                />
                {errors.mileage && <span className={styles.errorMsg}>{errors.mileage}</span>}
              </div>
            </div>

            {/* Preço */}
            <div className={`${styles.fieldGroup} ${errors.price ? styles.error : ''}`}>
              <label htmlFor="price">Preço (R$) *</label>
              <input
                type="number"
                id="price"
                name="price"
                className="input"
                placeholder="Ex: 89900"
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && <span className={styles.errorMsg}>{errors.price}</span>}
            </div>

            {/* Descrição */}
            <div className={styles.fieldGroup}>
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                name="description"
                className="input textarea"
                placeholder="Descreva os acessórios, estado de conservação, histórico da moto..."
                value={formData.description}
                onChange={handleChange}
                rows={5}
              />
            </div>

            {/* Destaque */}
            <div className={styles.checkboxGroup}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                <span className={styles.checkmark}>
                  <Star size={14} />
                </span>
                <span>Marcar como destaque na página inicial</span>
              </label>
            </div>

            {/* Imagens */}
            <div className={`${styles.fieldGroup} ${errors.images ? styles.error : ''}`}>
              <label>Fotos da Moto *</label>
              
              <div className={styles.imageUpload}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus size={24} />
                  <span>Adicionar Fotos</span>
                  <small>JPG, PNG ou WebP (máx. 10MB cada)</small>
                </button>
              </div>

              {allImages.length > 0 && (
                <div className={styles.imageGrid}>
                  {allImages.map((img, index) => (
                    <div key={img.id || img.index} className={styles.imageItem}>
                      <img src={img.url} alt={`Imagem ${index + 1}`} />
                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={() => 
                          img.type === 'existing' 
                            ? removeExistingImage(img.id) 
                            : removeNewImage(img.index)
                        }
                      >
                        <X size={16} />
                      </button>
                      {index === 0 && (
                        <span className={styles.primaryBadge}>Principal</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {errors.images && <span className={styles.errorMsg}>{errors.images}</span>}
            </div>

            {errors.submit && (
              <div className={styles.submitError}>{errors.submit}</div>
            )}

            <div className={styles.formActions}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPreview(true)}
                disabled={!formData.model}
              >
                <Eye size={18} />
                Preview
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {isEditing ? 'Salvar Alterações' : 'Publicar Moto'}
                  </>
                )}
              </button>
            </div>
          </motion.form>

          {/* Preview Card */}
          <motion.div
            className={styles.previewSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className={styles.previewTitle}>
              <Eye size={18} />
              Preview do Anúncio
            </h3>
            <div className={styles.previewCard}>
              <div className={styles.previewImage}>
                {allImages.length > 0 ? (
                  <img src={allImages[0].url} alt="Preview" />
                ) : (
                  <div className={styles.previewPlaceholder}>
                    <Car size={48} />
                    <span>Adicione uma foto</span>
                  </div>
                )}
                {formData.featured && (
                  <div className={styles.previewFeatured}>
                    <Star size={12} />
                    Destaque
                  </div>
                )}
              </div>
              <div className={styles.previewContent}>
                <h4>{formData.model || 'Nome do Modelo'}</h4>
                <div className={styles.previewSpecs}>
                  <span>{formData.year || '----'}</span>
                  <span>{formData.mileage ? `${formatMileage(formData.mileage)} km` : '--- km'}</span>
                </div>
                <div className={styles.previewPrice}>
                  {formData.price ? formatPrice(formData.price) : 'R$ ---'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Full Preview Modal */}
      {showPreview && (
        <motion.div
          className={styles.previewModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowPreview(false)}
        >
          <div className={styles.previewModalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closePreview} onClick={() => setShowPreview(false)}>
              <X size={24} />
            </button>
            <div className={styles.fullPreview}>
              <div className={styles.fullPreviewGallery}>
                {allImages.length > 0 ? (
                  <img src={allImages[0].url} alt="Preview" />
                ) : (
                  <div className={styles.previewPlaceholder}>
                    <Car size={64} />
                  </div>
                )}
              </div>
              <div className={styles.fullPreviewInfo}>
                <span className={styles.fullPreviewType}>
                  {formData.type === 'moto' ? 'Moto' : 'Carro'}
                </span>
                <h2>{formData.model || 'Nome do Modelo'}</h2>
                <div className={styles.fullPreviewSpecs}>
                  <div>
                    <span>Ano</span>
                    <strong>{formData.year}</strong>
                  </div>
                  <div>
                    <span>Quilometragem</span>
                    <strong>{formData.mileage ? `${formatMileage(formData.mileage)} km` : '-'}</strong>
                  </div>
                </div>
                <div className={styles.fullPreviewPrice}>
                  <span>Valor</span>
                  <strong>{formData.price ? formatPrice(formData.price) : 'R$ ---'}</strong>
                </div>
                {formData.description && (
                  <div className={styles.fullPreviewDescription}>
                    <h4>Descrição</h4>
                    <p>{formData.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

