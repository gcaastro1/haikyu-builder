'use client';

import { useFormStatus } from 'react-dom';
import { RotateCw } from 'lucide-react';
import "@/styles/components/_submit-button.scss"; // importa o estilo

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="submit-button"
      disabled={pending}
    >
      {pending ? (
        <div className="submit-button__loading">
          <RotateCw size={20} className="submit-button__icon" />
          Enviando...
        </div>
      ) : (
        "Cadastrar Personagem"
      )}
    </button>
  );
}
