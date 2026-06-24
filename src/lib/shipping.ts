export const EGYPT_GOVERNORATES = [
  { key: 'cairo', name: 'القاهرة', aliases: ['القاهره', 'cairo'] },
  { key: 'giza', name: 'الجيزة', aliases: ['الجيزه', 'جيزة', 'جيزه', 'giza'] },
  { key: 'sharqia', name: 'الشرقية', aliases: ['الشرقيه', 'شرقية', 'شرقيه'] },
  { key: 'dakahlia', name: 'الدقهلية', aliases: ['الدقهليه', 'دقهلية', 'دقهليه'] },
  { key: 'beheira', name: 'البحيرة', aliases: ['البحيره', 'بحيرة', 'بحيره'] },
  { key: 'minya', name: 'المنيا', aliases: ['منيا'] },
  { key: 'qalyubia', name: 'القليوبية', aliases: ['القليوبيه', 'قليوبية', 'قليوبيه'] },
  { key: 'sohag', name: 'سوهاج', aliases: [] },
  { key: 'alexandria', name: 'الإسكندرية', aliases: ['الاسكندرية', 'الاسكندريه', 'اسكندرية', 'اسكندريه', 'alexandria'] },
  { key: 'gharbia', name: 'الغربية', aliases: ['الغربيه', 'غربية', 'غربيه'] },
  { key: 'assiut', name: 'أسيوط', aliases: ['اسيوط', 'assiut', 'asyut'] },
  { key: 'monufia', name: 'المنوفية', aliases: ['المنوفيه', 'منوفية', 'منوفيه'] },
  { key: 'faiyum', name: 'الفيوم', aliases: ['فيوم', 'faiyum', 'fayoum'] },
  { key: 'kafr_el_sheikh', name: 'كفر الشيخ', aliases: ['كفرالشيخ'] },
  { key: 'qena', name: 'قنا', aliases: [] },
  { key: 'beni_suef', name: 'بني سويف', aliases: ['بنى سويف', 'بنيسويف', 'بني سويف'] },
  { key: 'aswan', name: 'أسوان', aliases: ['اسوان'] },
  { key: 'damietta', name: 'دمياط', aliases: [] },
  { key: 'ismailia', name: 'الإسماعيلية', aliases: ['الاسماعيلية', 'الاسماعيليه', 'اسماعيلية', 'اسماعيليه'] },
  { key: 'luxor', name: 'الأقصر', aliases: ['الاقصر', 'اقصر'] },
  { key: 'suez', name: 'السويس', aliases: ['سويس', 'suez'] },
  { key: 'port_said', name: 'بورسعيد', aliases: ['بور سعيد', 'port said', 'portsaid'] },
  { key: 'matrouh', name: 'مطروح', aliases: ['مرسى مطروح', 'مرسي مطروح'] },
  { key: 'north_sinai', name: 'شمال سيناء', aliases: ['شمال سينا', 'شمالسيناء', 'شمالسينا'] },
  { key: 'red_sea', name: 'البحر الأحمر', aliases: ['البحر الاحمر', 'بحر احمر', 'البحرالاحمر'] },
  { key: 'new_valley', name: 'الوادي الجديد', aliases: ['الوادى الجديد', 'وادي جديد', 'وادى جديد', 'الواديالجديد', 'الوادىالجديد'] },
  { key: 'south_sinai', name: 'جنوب سيناء', aliases: ['جنوب سينا', 'جنوبسيناء', 'جنوبسينا'] },
] as const;

export type EgyptGovernorate = (typeof EGYPT_GOVERNORATES)[number];
export type EgyptGovernorateKey = EgyptGovernorate['key'];
export type ShippingRates = Partial<Record<EgyptGovernorateKey, number>>;

const GOVERNORATES_BY_KEY = new Map(
  EGYPT_GOVERNORATES.map((governorate) => [governorate.key, governorate])
);

const EASTERN_ARABIC_DIGITS: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
};

function normalizeDigits(value: string) {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => EASTERN_ARABIC_DIGITS[digit] ?? digit);
}

export function normalizeArabicText(value: string) {
  return normalizeDigits(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/ـ/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\u0621-\u064A0-9a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const GOVERNORATE_MATCHERS = EGYPT_GOVERNORATES.flatMap((governorate) => {
  const aliases = new Set([governorate.name, ...governorate.aliases]);
  const normalizedAliases = Array.from(aliases).map((alias) => {
    const normalized = normalizeArabicText(alias);
    return {
      key: governorate.key,
      value: normalized,
      compact: normalized.replace(/\s/g, ''),
    };
  });

  return normalizedAliases;
}).sort((a, b) => b.compact.length - a.compact.length);

export function getGovernorateByKey(key: string | null | undefined) {
  if (!key) return null;
  return GOVERNORATES_BY_KEY.get(key as EgyptGovernorateKey) ?? null;
}

export function detectGovernorateFromAddress(address: string) {
  const normalizedAddress = normalizeArabicText(address);
  if (!normalizedAddress) return null;

  const compactAddress = normalizedAddress.replace(/\s/g, '');
  const match = GOVERNORATE_MATCHERS.find((matcher) => (
    normalizedAddress.includes(matcher.value) ||
    compactAddress.includes(matcher.compact)
  ));

  return match?.key ?? null;
}

export function getShippingRate(
  rates: ShippingRates | null | undefined,
  governorateKey: EgyptGovernorateKey | null | undefined
) {
  if (!rates || !governorateKey) return null;
  const rate = rates[governorateKey];
  return typeof rate === 'number' && Number.isFinite(rate) && rate >= 0 ? rate : null;
}

export function hasConfiguredShippingRates(rates: ShippingRates | null | undefined) {
  if (!rates) return false;

  return EGYPT_GOVERNORATES.some((governorate) => getShippingRate(rates, governorate.key) !== null);
}

export function normalizeShippingRatesInput(input: unknown) {
  const rates: ShippingRates = {};
  const errors: string[] = [];
  const source = input && typeof input === 'object' ? input as Record<string, unknown> : {};

  for (const governorate of EGYPT_GOVERNORATES) {
    const rawValue = source[governorate.key];

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      continue;
    }

    const value = typeof rawValue === 'string'
      ? Number(normalizeDigits(rawValue.trim()))
      : Number(rawValue);

    if (!Number.isFinite(value) || value < 0) {
      errors.push(`${governorate.name}: سعر الشحن غير صالح`);
      continue;
    }

    rates[governorate.key] = Math.round(value * 100) / 100;
  }

  return { rates, errors };
}
