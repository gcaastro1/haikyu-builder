"use client";

import { useFormState } from "react-dom";
import { createCharacter } from "../lib/actions";
import { SectionHeader } from "../components/SectionHeader";
import { StyleSelector } from "../components/StyleSelector";
import { useState } from "react";
import { ImageSelector } from "../components/ImageSelector";

const positions = ["OP", "MB", "WS", "S", "L"];
const rarities = ["SR", "SSR", "UR", "SP"];
const schools = [
  "Shiratorizawa",
  "Nekoma",
  "Fukurōdani",
  "Aoba Johsai",
  "Inarizaki",
  "Kamomedai",
  "Karasuno",
  "Date Tech",
  "Itachiyama",
  "Johzenji",
  "Kitagawa Daichi",
];

export default function CadastroPage() {
  const initialState = { message: "" };
  const [state, formAction] = useFormState(createCharacter, initialState);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile || uploadStatus === "uploading") return;

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_UPLOAD_PRESET
    ) {
      setUploadStatus("error");
      setUploadError("ERRO: Cloudinary não configurado.");
      return;
    }

    setUploadStatus("uploading");
    setUploadError("");
    setImageUrl("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok && data.secure_url) {
        setUploadStatus("success");
        setImageUrl(data.secure_url);
        setUploadError("");
        formAction(new FormData(event.currentTarget));
      } else {
        setUploadStatus("error");
        setUploadError(
          data.error?.message || "Falha no upload da imagem."
        );
      }
    } catch (error) {
      setUploadStatus("error");
      setUploadError("Erro de rede durante o upload.");
    }
  };

  return (
    <main className="cadastro-page">
      <SectionHeader title="Cadastro de Personagem" />

      {state.message && (
        <p
          className={`cadastro-page__message ${
            state.message.startsWith("Erro") || state.message.startsWith("Falha")
              ? "error"
              : "success"
          }`}
        >
          {state.message}
        </p>
      )}

      <form
        action={formAction}
        className="cadastro-page__form"
      >
        <div className="cadastro-page__field cadastro-page__field--wide">
          <label>Nome</label>
          <input type="text" name="name" required />
        </div>

        <div className="cadastro-page__field cadastro-page__field--wide">
          <ImageSelector name="image_url" onChange={function (newUrl: string): void {
                      throw new Error("Function not implemented.");
                  } } />
        </div>

        <div className="cadastro-page__field">
          <label>Posição</label>
          <select name="position" required>
            <option value="">Selecione a Posição</option>
            {positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="cadastro-page__field">
          <label>Raridade</label>
          <select name="rarity" required>
            <option value="">Selecione a Raridade</option>
            {rarities.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="cadastro-page__field">
          <label>Escola</label>
          <select name="school" required>
            <option value="">Selecione a Escola</option>
            {schools.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="cadastro-page__field cadastro-page__field--wide">
          <StyleSelector name="styles" />
        </div>

        <div className="cadastro-page__section">
          <SectionHeader title="Atributos (0–999)" />
        </div>

        <div className="cadastro-page__attributes">
          {[
            { label: "Saque (Serve)", name: "serve" },
            { label: "Ataque (Attack)", name: "attack" },
            { label: "Passe (Set)", name: "set" },
            { label: "Recepção (Receive)", name: "receive" },
            { label: "Bloqueio (Block)", name: "block" },
            { label: "Defesa (Defense)", name: "defense" },
          ].map((attr) => (
            <div key={attr.name} className="cadastro-page__attr">
              <label>{attr.label}</label>
              <input
                type="number"
                name={attr.name}
                min="0"
                max="999"
                defaultValue={0}
                required
              />
            </div>
          ))}
        </div>

        <div className="cadastro-page__submit">
          <button
            type="submit"
            disabled={uploadStatus === "uploading"}
          >
            {uploadStatus === "uploading"
              ? "Aguarde o Upload..."
              : "Cadastrar Personagem"}
          </button>
        </div>
      </form>
    </main>
  );
}
