import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitário para mesclar classes Tailwind
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formatar valor monetário
 */
export function formatCurrency(value) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue || 0);
}

/**
 * Formatar data
 */
export function formatDate(date, formatString = 'dd/MM/yyyy') {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString, { locale: ptBR });
}

/**
 * Formatar data e hora
 */
export function formatDateTime(date) {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
}

/**
 * Formatar data para input
 */
export function formatDateForInput(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Obter iniciais do nome
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Truncar texto
 */
export function truncate(text, length = 50) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Validar CPF
 */
export function isValidCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
}

/**
 * Gerar cor aleatória
 */
export function randomColor() {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#ec4899', '#f43f5e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Calcular porcentagem
 */
export function calculatePercentage(value, total) {
  if (!total || total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
}

/**
 * Debounce
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}