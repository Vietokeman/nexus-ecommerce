/** Shared Framer Motion variants for staggered entrance animations */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.18,
      when: 'beforeChildren' as const,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 105,
      damping: 18,
      mass: 0.32,
    },
  },
};
