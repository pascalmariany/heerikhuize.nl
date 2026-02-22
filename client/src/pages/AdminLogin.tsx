import { useState } from "react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        setLocation("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Inloggen mislukt");
      }
    } catch {
      setError("Er is een fout opgetreden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAEE] flex items-center justify-center px-4" data-testid="page-admin-login">
      <div className="w-full max-w-md bg-white shadow-lg p-8">
        <h1 className="text-2xl font-bold text-[#333] mb-2 font-heading" data-testid="text-login-title">
          Heerikhuize HQ
        </h1>
        <p className="text-sm text-[#777] mb-8">Log in om projecten te beheren</p>

        <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-login">
          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50] transition-colors bg-white"
              data-testid="input-login-email"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#333] uppercase tracking-wider mb-2">
              Wachtwoord
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-[#96AB50] transition-colors bg-white"
              data-testid="input-login-password"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium" data-testid="text-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#96AB50] text-white px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[#829745] transition-colors disabled:opacity-60"
            data-testid="button-login"
          >
            {loading ? "Inloggen..." : "Inloggen"}
          </button>
        </form>

        <a
          href="/"
          className="block text-center mt-6 text-sm text-[#96AB50] hover:text-[#829745] transition-colors"
          data-testid="link-back-home"
        >
          Terug naar website
        </a>
      </div>
    </div>
  );
}
