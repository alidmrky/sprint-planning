"use client";

import { ReactNode } from "react";
import { Modal } from "./modal";
import { Button } from "./button";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ open, title = "Onay", description, confirmText = "Evet", cancelText = "Vazgeç", onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-4">
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>{cancelText}</Button>
          <Button variant="destructive" onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </Modal>
  );
}


