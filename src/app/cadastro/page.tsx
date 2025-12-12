"use client";

import { useState } from "react";
import { ImageSelector } from "../components/ImageSelector";
import { SectionHeader } from "../components/SectionHeader";
import { StyleSelector } from "../components/StyleSelector";
import { createCharacterLocal } from "../lib/actions";

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
  const [message, setMessage] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus("saving");
    setMessage("");
    const fd = new FormData(event.currentTarget);
    const name = (fd.get("name") as string) || "";
    const position = (fd.get("position") as string) || "";
    const rarity = (fd.get("rarity") as string) || "";
    const school = (fd.get("school") as string) || "";
    const styles = ((fd.get("styles") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    const serve = Number(fd.get("serve") || 0);
    const attack = Number(fd.get("attack") || 0);
    const setVal = Number(fd.get("set") || 0);
    const receive = Number(fd.get("receive") || 0);
    const block = Number(fd.get("block") || 0);
    const defense = Number(fd.get("defense") || 0);

    const img = imageUrl || "/images/placeholder.png";

    if (!name || !position || !rarity || !school) {
      setSubmitStatus("error");
      setMessage("Erro: Campos obrigatórios (Nome, Posição, Raridade, Escola) estão faltando.");
      return;
    }

    const result = await createCharacterLocal({
      name,
      position,
      rarity,
      school,
      image_url: img,
      styles,
      serve,
      attack,
      set: setVal,
      receive,
      block,
      defense,
    } as any);

    setSubmitStatus(result.success ? "success" : "error");
    setMessage(result.message);
    if (result.success) event.currentTarget.reset();
  };

  return (
    <main className="cadastro-page">
      <SectionHeader title="Cadastro de Personagem" />

      {message && (
        <p
          className={`cadastro-page__message ${
            message.startsWith("Erro") || message.startsWith("Falha")
              ? "error"
              : "success"
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="cadastro-page__form">
        <div className="cadastro-page__field cadastro-page__field--wide">
          <label>Nome</label>
          <input type="text" name="name" required />
        </div>

        <div className="cadastro-page__field cadastro-page__field--wide">
          <ImageSelector name="image_url" initialValue={imageUrl} onChange={setImageUrl} />
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
          <button type="submit" disabled={submitStatus === "saving"}>
            {submitStatus === "saving" ? "Salvando..." : "Cadastrar Personagem"}
          </button>
        </div>
      </form>
    </main>
  );
}
