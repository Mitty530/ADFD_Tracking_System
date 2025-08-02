import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ConfirmDialogProps } from '../types/withdrawalTypes';

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconColor: '#DC3545',
          confirmButtonBg: '#DC3545',
          confirmButtonHover: '#C82333',
          icon: AlertCircle
        };
      case 'warning':
        return {
          iconColor: '#FFA500',
          confirmButtonBg: '#FFA500',
          confirmButtonHover: '#E6940A',
          icon: AlertTriangle
        };
      case 'info':
        return {
          iconColor: '#007CBA',
          confirmButtonBg: '#007CBA',
          confirmButtonHover: '#005A8B',
          icon: Info
        };
      default:
        return {
          iconColor: '#FFA500',
          confirmButtonBg: '#FFA500',
          confirmButtonHover: '#E6940A',
          icon: AlertTriangle
        };
    }
  };

  const styles = getVariantStyles();
  const IconComponent = styles.icon;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error in confirm action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onCancel();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center p-4 pt-8"
          style={{ zIndex: 10001 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
            style={{ border: '1px solid #DEE1E3', zIndex: 10002 }}
            initial={{ scale: 0.8, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: '#DEE1E3' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${styles.iconColor}20` }}
                  >
                    <IconComponent 
                      className="w-5 h-5" 
                      style={{ color: styles.iconColor }} 
                    />
                  </div>
                  <h3 
                    className="text-lg font-bold"
                    style={{ color: '#323E48' }}
                  >
                    {title}
                  </h3>
                </div>
                
                <motion.button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="p-3 rounded-full transition-all duration-200 bg-red-600 hover:bg-red-700 text-white shadow-xl border-2 border-red-500"
                  whileHover={{
                    scale: 1.1
                  }}
                  whileTap={{ scale: 0.9 }}
                  style={{ backgroundColor: '#DC2626', borderColor: '#EF4444' }}
                >
                  <X className="w-5 h-5 font-bold text-white" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p 
                className="text-sm leading-relaxed"
                style={{ color: '#5B6670' }}
              >
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t flex space-x-3" style={{ borderColor: '#DEE1E3' }}>
              <motion.button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-2xl font-medium transition-all duration-200"
                style={{ 
                  backgroundColor: '#F9F9F9',
                  border: '1px solid #DEE1E3',
                  color: '#323E48'
                }}
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: '#F1F3F4'
                }}
                whileTap={{ scale: 0.98 }}
              >
                {cancelText}
              </motion.button>
              
              <motion.button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-2xl font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2"
                style={{
                  backgroundColor: isLoading ? '#91A3B0' : styles.confirmButtonBg
                }}
                whileHover={!isLoading ? {
                  scale: 1.02,
                  backgroundColor: styles.confirmButtonHover
                } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{confirmText}</span>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
