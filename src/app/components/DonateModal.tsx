"use client";

import React from "react";
import { X } from "lucide-react";
import {QRCodeSVG} from 'qrcode.react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonateModal({ isOpen, onClose }: DonateModalProps) {
  if (!isOpen) return null;

  const pixKey = "gcaastro2@gmail.com"; 

  return (
    <div className="donate-modal__overlay" onClick={onClose}>
      <div className="donate-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="donate-modal__close" onClick={onClose}>
          <X size={20} />
        </button>
        <h2 className="donate-modal__title">Apoie o projeto 💛</h2>
        <p className="donate-modal__text">
          Escaneie o QR Code abaixo para enviar um PIX:
        </p>
        <QRCodeSVG value={pixKey} size={180} />
        <p className="donate-modal__key">PIX: {pixKey}</p>
      </div>
    </div>
  );
}
