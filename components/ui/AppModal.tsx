"use client";

import React from "react";
// PERUBAHAN 1: Sesuaikan path impor CSS
import styles from "./AppModal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// PERUBAHAN 2: Ganti nama fungsi menjadi AppModal
export default function AppModal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
