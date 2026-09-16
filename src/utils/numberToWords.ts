// Converts a number to Indian Currency words
// Example: 12540 -> "Twelve Thousand Five Hundred Forty Only"

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertLessThanThousand(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n] + ' ';
  if (n < 100) {
    return TENS[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ONES[n % 10] : '') + ' ';
  }
  return ONES[Math.floor(n / 100)] + ' Hundred ' + (n % 100 !== 0 ? convertLessThanThousand(n % 100) : '');
}

export function numberToWordsINR(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';

  let num = Math.abs(rounded);
  let words = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const remainder = num;

  if (crore > 0) {
    words += convertLessThanThousand(crore).trim() + ' Crore ';
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh).trim() + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand).trim() + ' Thousand ';
  }
  if (remainder > 0) {
    words += convertLessThanThousand(remainder).trim() + ' ';
  }

  return 'Rupees ' + words.trim() + ' Only';
}
