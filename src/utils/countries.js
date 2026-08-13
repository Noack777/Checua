export const COUNTRIES = [
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'JP', name: 'Japón', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'KR', name: 'Corea del Sur', flag: '🇰🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'RU', name: 'Rusia', flag: '🇷🇺' },
  { code: 'ZA', name: 'Sudáfrica', flag: '🇿🇦' },
  { code: 'AE', name: 'Emiratos Árabes Unidos', flag: '🇦🇪' },
  { code: 'SA', name: 'Arabia Saudita', flag: '🇸🇦' },
  { code: 'EG', name: 'Egipto', flag: '🇪🇬' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'TR', name: 'Turquía', flag: '🇹🇷' },
  { code: 'GR', name: 'Grecia', flag: '🇬🇷' },
  { code: 'NL', name: 'Países Bajos', flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'CH', name: 'Suiza', flag: '🇨🇭' },
  { code: 'SE', name: 'Suecia', flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega', flag: '🇳🇴' },
  { code: 'DK', name: 'Dinamarca', flag: '🇩🇰' },
  { code: 'FI', name: 'Finlandia', flag: '🇫🇮' },
  { code: 'PL', name: 'Polonia', flag: '🇵🇱' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'NZ', name: 'Nueva Zelanda', flag: '🇳🇿' },
  { code: 'IE', name: 'Irlanda', flag: '🇮🇪' },
  { code: 'SG', name: 'Singapur', flag: '🇸🇬' },
  { code: 'MY', name: 'Malasia', flag: '🇲🇾' },
  { code: 'TH', name: 'Tailandia', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Filipinas', flag: '🇵🇭' },
  { code: 'PK', name: 'Pakistán', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladés', flag: '🇧🇩' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenia', flag: '🇰🇪' },
  { code: 'MA', name: 'Marruecos', flag: '🇲🇦' },
  { code: 'other', name: 'Otro', flag: '🌍' }
];

export const findCountry = (value) => {
  if (!value) return null;
  const clean = String(value).trim();
  if (!clean) return null;

  const byCode = COUNTRIES.find(
    c => c.code.toLowerCase() === clean.toLowerCase()
  );
  if (byCode) return byCode;

  const byName = COUNTRIES.find(
    c => c.name.toLowerCase() === clean.toLowerCase()
  );
  if (byName) return byName;

  const byNameContains = COUNTRIES.find(
    c => c.name.toLowerCase().includes(clean.toLowerCase()) ||
         clean.toLowerCase().includes(c.name.toLowerCase())
  );
  if (byNameContains) return byNameContains;

  return null;
};

export const getCountryFlag = (value) => {
  const country = findCountry(value);
  return country ? country.flag : '🌍';
};

export const getCountryName = (value) => {
  const country = findCountry(value);
  return country ? country.name : value || '';
};

export const COUNTRIES_BY_NAME = COUNTRIES.reduce((acc, c) => {
  acc[c.name] = c.flag;
  return acc;
}, {});

export const COUNTRIES_BY_CODE = COUNTRIES.reduce((acc, c) => {
  acc[c.code] = c.flag;
  return acc;
}, {});
