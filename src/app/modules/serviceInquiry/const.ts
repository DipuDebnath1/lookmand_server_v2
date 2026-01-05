export const ServiceInquiryStatuses = {
  active: 'active',
  respond: 'respond',
  closed: 'closed',
} as const;

export const ServiceInquiryPopulate = {
  fields:
    'author subCategory region location status additionalInfo date createdAt',
  author: {
    path: 'author',
    select: 'name email phone email image',
  },
  subCategory: {
    path: 'subCategory',
    select: 'name category',
  },
};
