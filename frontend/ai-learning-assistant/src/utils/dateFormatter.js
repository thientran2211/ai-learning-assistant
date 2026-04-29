/**
 * Format date based on application language
 * @param {string|Date} dateString - Date string or Date object
 * @param {string} lang - 'en' or 'vi'
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, lang = 'en') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return lang === 'vi' ? 'Ngày không hợp lệ' : 'Invalid Date';

  if (lang === 'vi') {
    // Tiếng Việt: DD/MM/YYYY HH:mm:ss
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  } else {
    // Tiếng Anh: M/D/YYYY h:mm A
    return new Intl.DateTimeFormat('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "2 giờ trước")
 * @param {string|Date} dateString 
 * @param {string} lang 
 * @returns {string}
 */
export const formatRelativeTime = (dateString, lang = 'en') => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (lang === 'vi') {
    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return formatDate(dateString, 'vi');
  } else {
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDate(dateString, 'en');
  }
};


import { useTranslation } from 'react-i18next';

export const useDateFormat = () => {
  const { i18n } = useTranslation();
  
  return {
    formatDate: (date) => formatDate(date, i18n.language),
    formatRelativeTime: (date) => formatRelativeTime(date, i18n.language),
    language: i18n.language
  };
};