'use client';

import { useFormStatus } from 'react-dom';
import { RotateCw } from 'lucide-react';

export function SubmitButton() {
    const { pending } = useFormStatus();
    
    return (
        <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-500"
            disabled={pending}
        >
            {pending ? (
                <div className="flex items-center">
                    <RotateCw size={20} className="animate-spin mr-2" />
                    Enviando...
                </div>
            ) : (
                "Cadastrar Personagem"
            )}
        </button>
    );
}