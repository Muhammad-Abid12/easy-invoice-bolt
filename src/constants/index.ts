export const APP_NAME = 'Easy Invoice Manager';
export const APP_TAGLINE = 'Professional Invoice Management for Pakistan';

export const CURRENCY = 'PKR';
export const CURRENCY_SYMBOL = '₨';

export const DEFAULT_TRIAL_DAYS = 30;
export const DEFAULT_FREE_INVOICES = 10;

export const INVOICE_STATUSES = {
  draft: { label: 'Draft', color: 'secondary' as const },
  sent: { label: 'Sent', color: 'info' as const },
  paid: { label: 'Paid', color: 'success' as const },
  overdue: { label: 'Overdue', color: 'error' as const },
  cancelled: { label: 'Cancelled', color: 'warning' as const },
};

export const PAKISTANI_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Larkana',
  'Sheikhupura',
  'Jhang',
  'Gujrat',
  'DG Khan',
  'Sahiwal',
];

export const VAT_TAX_RATES = [0, 5, 10, 15, 17, 18, 20];

export const WHATSAPP_NUMBER = '923082434421';
