import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WhatsAppButton = () => {
  const phoneNumber = '+905421400755';
  const message = 'Merhaba! Herbalife ürünleri hakkında bilgi almak istiyorum.';
  
  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.button
      data-testid="whatsapp-button"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
      <motion.span
        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        1
      </motion.span>
    </motion.button>
  );
};

export default WhatsAppButton;