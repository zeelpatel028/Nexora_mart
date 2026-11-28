import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../../api/storage';

interface SettingsContextType {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  currencySymbol: string;
  billSoundEnabled: boolean;
  invoiceTemplate: string;
  setTheme: (t: 'light' | 'dark' | 'system') => Promise<void>;
  setLanguage: (l: string) => Promise<void>;
  setCurrency: (c: string) => Promise<void>;
  setBillSoundEnabled: (enabled: boolean) => Promise<void>;
  setInvoiceTemplate: (template: string) => Promise<void>;
  playBillSound: () => void;
}

const SettingsContext = createContext<SettingsContextType>({
  theme: 'system',
  language: 'en',
  currency: 'INR',
  currencySymbol: '₹',
  billSoundEnabled: true,
  invoiceTemplate: 'modern_orange',
  setTheme: async () => {},
  setLanguage: async () => {},
  setCurrency: async () => {},
  setBillSoundEnabled: async () => {},
  setInvoiceTemplate: async () => {},
  playBillSound: () => {},
});

const readJson = async <T,>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await storage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = async (key: string, val: any): Promise<void> => {
  try {
    await storage.setItem(key, JSON.stringify(val));
  } catch {}
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguageState] = useState<string>('en');
  const [currency, setCurrencyState] = useState<string>('INR');
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');
  const [billSoundEnabled, setBillSoundState] = useState<boolean>(true);
  const [invoiceTemplate, setInvoiceTemplateState] = useState<string>('modern_orange');

  useEffect(() => {
    const initSettings = async () => {
      try {
        const savedTheme = await readJson('setting_theme', 'system');
        const savedLang = await readJson('setting_lang', 'en');
        const savedCurr = await readJson('tulsimart_currency', 'INR');
        const savedSound = await readJson('setting_bill_sound', true);
        const savedTpl = await readJson('setting_inv_template', 'modern_orange');

        setThemeState(savedTheme as any);
        setLanguageState(savedLang);
        setCurrencyState(savedCurr);
        setCurrencySymbol(savedCurr === 'USD' ? '$' : savedCurr === 'EUR' ? '€' : '₹');
        setBillSoundState(savedSound);
        setInvoiceTemplateState(savedTpl);
      } catch (err) {
        console.warn('SettingsContext initialization warning:', err);
      }
    };
    initSettings();
  }, []);

  const setTheme = async (t: 'light' | 'dark' | 'system') => {
    setThemeState(t);
    await writeJson('setting_theme', t);
  };

  const setLanguage = async (l: string) => {
    setLanguageState(l);
    await writeJson('setting_lang', l);
  };

  const setCurrency = async (c: string) => {
    setCurrencyState(c);
    const sym = c === 'USD' ? '$' : c === 'EUR' ? '€' : '₹';
    setCurrencySymbol(sym);
    await writeJson('tulsimart_currency', c);
  };

  const setBillSoundEnabled = async (enabled: boolean) => {
    setBillSoundState(enabled);
    await writeJson('setting_bill_sound', enabled);
  };

  const setInvoiceTemplate = async (template: string) => {
    setInvoiceTemplateState(template);
    await writeJson('setting_inv_template', template);
  };

  const playBillSound = () => {
    if (!billSoundEnabled) return;
    console.log('[SOUND]: Ding! Payment received chime.');
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        language,
        currency,
        currencySymbol,
        billSoundEnabled,
        invoiceTemplate,
        setTheme,
        setLanguage,
        setCurrency,
        setBillSoundEnabled,
        setInvoiceTemplate,
        playBillSound,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
export default SettingsContext;
