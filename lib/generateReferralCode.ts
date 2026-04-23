// Partner referral code generation

export function generateReferralCode(fullName: string): string {
  const prefix = fullName
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, 'X');
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}${suffix}`;
}
// Example: "Ravi Kumar" → "RAVI7823"
// Example: "Sita" → "SITA4901"
