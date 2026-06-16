import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { AuthContext } from "./AuthContext";

export const SettingsContext = createContext();

const DEFAULTS = {
  currency: "INR",
  date_format: "DD/MM/YYYY",
  theme: "dark",
  monthly_budget: 0,
  default_category: "Other",
  notifications_enabled: true,
  anomaly_alerts: true,
  budget_warnings: true,
};

// Currency symbol map
export const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
};

export default function SettingsProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(() => {
    if (!token) return;
    setLoading(true);
    api
      .get("/api/settings/")
      .then((res) => setSettings({ ...DEFAULTS, ...res.data }))
      .catch(() => setSettings(DEFAULTS))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (patch) => {
    const updated = { ...settings, ...patch };
    setSettings(updated); // optimistic update
    try {
      const res = await api.put("/api/settings/", patch);
      setSettings({ ...DEFAULTS, ...res.data });
    } catch {
      setSettings(settings); // rollback on error
    }
  };

  const symbol = CURRENCY_SYMBOLS[settings.currency] || "₹";

  const formatAmount = (amount) =>
    `${symbol}${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}`;

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, loading, symbol, formatAmount }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
