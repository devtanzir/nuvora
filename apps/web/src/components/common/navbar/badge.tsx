import { motion } from 'framer-motion';
const Badge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <motion.span
      key={count}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-[#B58B45] text-[10px] font-semibold text-white flex items-center justify-center px-[3px] leading-none"
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
}

export default Badge;
