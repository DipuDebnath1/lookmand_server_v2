import httpStatus from 'http-status';
import AppError from '../ErrorHandler/AppError';

// Helper function to add duration to the current date
const calculateEndDate = (
  duration: number,
  type: 'day' | 'week' | 'month' | 'year',
): Date => {
  const startDate = new Date();

  switch (type) {
    case 'day':
      startDate.setDate(startDate.getDate() + duration);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() + duration * 7); // 7 days in a week
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() + duration);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() + duration);
      break;
    default:
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid subscription type');
  }

  return startDate;
};

export default calculateEndDate;
