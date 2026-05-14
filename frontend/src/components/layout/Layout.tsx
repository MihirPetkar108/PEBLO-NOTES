import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
    LayoutDashboard,
    FileText,
    Archive,
    Search,
    Sun,
    Moon,
    LogOut,
    Plus,
    Sparkles,
    Menu,
    X,
    ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/auth.store";
import { useThemeStore } from "../../store/theme.store";
import { getInitials, cn } from "../../lib/utils";

interface LayoutProps {
    children: React.ReactNode;
    onNewNote?: () => void;
}

const navItems = [
    { to: "/", label: "Notes", icon: FileText, exact: true },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/search", label: "Search", icon: Search },
    { to: "/archive", label: "Archive", icon: Archive },
];

export const Layout: React.FC<LayoutProps> = ({ children, onNewNote }) => {
    const { user, logout } = useAuthStore();
    const { theme, toggle } = useThemeStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        queryClient.clear();
        navigate("/login");
    };

    const handleNewNote = () => {
        onNewNote?.();
        setSidebarOpen(false);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[var(--border)]">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-[var(--text)] text-base">
                    Peblo Notes
                </span>
            </div>

            {/* New note button */}
            <div className="px-3 py-3">
                <button
                    onClick={handleNewNote}
                    className="btn-primary w-full text-sm h-9"
                >
                    <Plus className="w-4 h-4" />
                    New Note
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 pb-3 space-y-0.5">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.exact}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group",
                                isActive
                                    ? "bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-medium"
                                    : "text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]",
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon
                                    className={cn(
                                        "w-4 h-4",
                                        isActive
                                            ? "text-brand-600 dark:text-brand-400"
                                            : "",
                                    )}
                                />
                                {item.label}
                                {isActive && (
                                    <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom */}
            <div className="px-3 pb-4 border-t border-[var(--border)] pt-3 space-y-1">
                <button
                    onClick={toggle}
                    className="btn-ghost w-full justify-start text-sm h-9"
                >
                    {theme === "light" ? (
                        <Moon className="w-4 h-4" />
                    ) : (
                        <Sun className="w-4 h-4" />
                    )}
                    {theme === "light" ? "Dark mode" : "Light mode"}
                </button>

                {/* User */}
                <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
                    <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {user ? getInitials(user.name) : "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[var(--text)] truncate">
                            {user?.name}
                        </div>
                        <div className="text-xs text-[var(--text-subtle)] truncate">
                            {user?.email}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-[var(--text-subtle)] hover:text-red-500 transition-colors p-1"
                        title="Sign out"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[var(--bg)] overflow-hidden">
            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col w-56 border-r border-[var(--border)] bg-[var(--bg-card)] flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 bottom-0 w-56 bg-[var(--bg-card)] border-r border-[var(--border)]">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile header */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-card)]">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="btn-ghost p-2"
                    >
                        {sidebarOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-semibold text-sm">
                            Peblo Notes
                        </span>
                    </div>
                    <button
                        onClick={handleNewNote}
                        className="ml-auto btn-primary text-xs h-8 px-3"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        New
                    </button>
                </div>

                <div className="flex-1 overflow-hidden">{children}</div>
            </main>
        </div>
    );
};
