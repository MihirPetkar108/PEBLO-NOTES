import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/auth.store";
import { cn } from "../../lib/utils";

interface AuthFormProps {
    mode: "login" | "signup";
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
    const navigate = useNavigate();
    const { login, signup, isLoading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (mode === "signup") {
                await signup(form.name, form.email, form.password);
                toast.success("Welcome to Peblo Notes!");
            } else if (mode === "login") {
                await login(form.email, form.password);
                toast.success("Welcome back!");
            }
            navigate("/");
        } catch {
            toast.error("Invalid credentials!");
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-800 dark:from-brand-900 dark:to-brand-950 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full border border-white"
                            style={{
                                width: `${(i + 1) * 120}px`,
                                height: `${(i + 1) * 120}px`,
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                        />
                    ))}
                </div>
                <div className="relative z-10 max-w-sm text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-semibold tracking-tight">
                            Peblo Notes
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold leading-tight mb-4">
                        Your AI-powered
                        <br />
                        thinking space
                    </h1>
                    <p className="text-white/70 text-lg leading-relaxed">
                        Capture ideas, generate summaries, extract action items
                        — all powered by AI. Organize smarter, think clearer.
                    </p>
                    <div className="mt-10 grid grid-cols-2 gap-4">
                        {[
                            {
                                label: "AI Summaries",
                                desc: "Auto-summarize notes",
                            },
                            {
                                label: "Smart Tags",
                                desc: "Organize effortlessly",
                            },
                            {
                                label: "Share Links",
                                desc: "Public note sharing",
                            },
                            { label: "Insights", desc: "Track productivity" },
                        ].map((f) => (
                            <div
                                key={f.label}
                                className="bg-white/10 rounded-xl p-4 backdrop-blur"
                            >
                                <div className="text-sm font-semibold mb-1">
                                    {f.label}
                                </div>
                                <div className="text-xs text-white/60">
                                    {f.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg)]">
                <div className="w-full max-w-md animate-in">
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-[var(--text)]">
                            Peblo Notes
                        </span>
                    </div>

                    <h2 className="text-2xl font-bold text-[var(--text)] mb-1">
                        {mode === "login"
                            ? "Sign in to your account"
                            : "Create your account"}
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm mb-8">
                        {mode === "login" ? (
                            <>
                                Don't have an account?{" "}
                                <Link
                                    to="/signup"
                                    className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
                                >
                                    Sign up free
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
                                >
                                    Sign in
                                </Link>
                            </>
                        )}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "signup" && (
                            <div>
                                <label className="label">Full name</label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                        )}
                        <div>
                            <label className="label">Email address</label>
                            <input
                                className="input"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <input
                                    className={cn("input", "pr-10")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 6 characters"
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            password: e.target.value,
                                        })
                                    }
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-muted)]"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full mt-2 h-11"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === "login"
                                        ? "Sign in"
                                        : "Create account"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                    {mode === "login" && (
                        <div className="mt-10 p-4 rounded-lg bg-white/5 text-sm text-[var(--text-muted)]">
                            <div className="font-medium mb-1">
                                Demo credentials
                            </div>
                            <div>
                                Email address:{" "}
                                <span className="font-mono">
                                    mihir@gmail.com
                                </span>
                            </div>
                            <div>
                                Password:{" "}
                                <span className="font-mono">Mihir123</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
