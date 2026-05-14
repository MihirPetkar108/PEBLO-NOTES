import React from "react";
import { Loader2, X } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    loadingText?: string;
    cancelText?: string;
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmText = "Delete",
    loadingText = confirmText,
    cancelText = "Cancel",
    isLoading = false,
    onConfirm,
    onCancel,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={isLoading ? undefined : onCancel}
            />
            <div className="relative z-10 w-full max-w-sm card p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <h3 className="font-semibold">{title}</h3>
                            <button
                                onClick={onCancel}
                                disabled={isLoading}
                                className="text-[var(--text-subtle)] hover:text-[var(--text-muted)]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mt-2">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="btn-secondary text-sm h-9 px-3"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="btn-danger text-sm h-9 px-3"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {loadingText}
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
