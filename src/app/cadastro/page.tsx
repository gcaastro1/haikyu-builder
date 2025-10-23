// src/app/cadastro/page.tsx
'use client';

import { useFormState } from 'react-dom';
import { createCharacter } from '../lib/actions'; 
import { SectionHeader } from '../components/SectionHeader'; 
import { StyleSelector } from '../components/StyleSelector';
import { useState } from 'react';
import { Upload } from 'lucide-react';
import { ImageSelector } from '../components/ImageSelector';

const positions = ["OP", "MB", "WS", "S", "L"];
const rarities = ["SR", "SSR", "UR", "SP"];
const schools = ["Shiratorizawa", "Nekoma", "Fukurōdani", "Aoba Johsai", "Inarizaki", "Kamomedai", "Karasuno", "Date Tech", "Itachiyama", "Johzenji", "Kitagawa Daichi"];


export default function CadastroPage() {
    const initialState = { message: '' };
    const [state, formAction] = useFormState(createCharacter, initialState);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [uploadError, setUploadError] = useState<string>('');


    const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); 

        if (!selectedFile || uploadStatus === 'uploading') return;
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_UPLOAD_PRESET) {
             setUploadStatus('error');
             setUploadError('ERRO: Cloudinary não configurado.');
             return;
        }

        setUploadStatus('uploading');
        setUploadError('');
        setImageUrl('');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();

            if (response.ok && data.secure_url) {
                setUploadStatus('success');
                setImageUrl(data.secure_url); // Salva a URL pública
                setUploadError('');
                
                // Agora que a imagem está carregada, enviar o resto do formulário
                formAction(new FormData(event.currentTarget));
            } else {
                setUploadStatus('error');
                setUploadError(data.error?.message || 'Falha no upload da imagem.');
            }

        } catch (error) {
            setUploadStatus('error');
            setUploadError('Erro de rede durante o upload.');
        }
    };

    return (
        <main className="container mx-auto p-4 sm:p-8 max-w-4xl">
            <SectionHeader titleBold="Cadastro" titleRegular="de Personagem" />

            {state.message && (
                <p className={`p-3 rounded-lg text-white mb-4 text-center ${
                    state.message.startsWith('Erro') || state.message.startsWith('Falha')
                    ? 'bg-red-600'
                    : 'bg-green-600'
                }`}>
                    {state.message}
                </p>
            )}

            <form action={formAction} className="bg-zinc-900 p-6 rounded-lg shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Nome</label>
                    <input type="text" name="name" required className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white" />
                </div>
                
                <div className="md:col-span-2">
                    <ImageSelector name="image_url" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Posição</label>
                    <select name="position" required className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white">
                        <option value="">Selecione a Posição</option>
                        {positions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Raridade</label>
                    <select name="rarity" required className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white">
                        <option value="">Selecione a Raridade</option>
                        {rarities.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Escola</label>
                    <select name="school" required className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white">
                        <option value="">Selecione a Escola</option>
                        {schools.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <StyleSelector name="styles" />
                </div>

                <div className="md:col-span-2 mt-4">
                    <SectionHeader titleBold="Atributos" titleRegular="(0-999)" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:col-span-2">
                    {[
                        { label: 'Saque (Serve)', name: 'serve' },
                        { label: 'Ataque (Attack)', name: 'attack' },
                        { label: 'Passe (Set)', name: 'set' },
                        { label: 'Recepção (Receive)', name: 'receive' },
                        { label: 'Bloqueio (Block)', name: 'block' },
                        { label: 'Defesa (Defense)', name: 'defense' },
                    ].map(attr => (
                        <div key={attr.name}>
                            <label className="block text-xs font-medium mb-1">{attr.label}</label>
                            <input type="number" name={attr.name} min="0" max="999" defaultValue={0} required className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white" />
                        </div>
                    ))}
                </div>

                {/* --- 4. BOTÃO DE ENVIO --- */}
                <div className="md:col-span-2 mt-6">
                    {/* O SubmitButton não é mais necessário aqui, o formulário é enviado pelo código. */}
                    <button
                        type="submit"
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors disabled:bg-gray-500"
                        disabled={uploadStatus === 'uploading'}
                    >
                        {uploadStatus === 'uploading' ? 'Aguarde o Upload...' : 'Cadastrar Personagem'}
                    </button>
                </div>
            </form>
        </main>
    );
}