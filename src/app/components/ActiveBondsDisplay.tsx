import { Bond } from "@/types";
import React from "react";

type ActiveBondsDisplayProps = {
  bonds: Bond[];
  loading: boolean;
};

export function ActiveBondsDisplay({
  bonds,
  loading,
}: ActiveBondsDisplayProps) {
  if (loading) {
    return (
      <>
        <div className="w-full max-w-xl mt-6 p-4 bg-zinc-950 rounded-lg border border-zinc-700">
          <p className="text-sm text-center text-zinc-400">
            Carregando vínculos...
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="text-xl font-semibold text-white text-left font-bricolage">
        <span className="font-bold">VINCULOS</span>
        <span className="font-normal opacity-80 ml-1">ATIVOS</span>
        <span className="font-normal opacity-80 ml-1">({bonds.length})</span>
      </h3>
      <div className="w-full max-w-xl mt-6 p-4 bg-zinc-950 rounded-lg border border-zinc-700">
        {bonds.length > 0 ? (
          <ul className="space-y-3">
            {bonds.map((bond) => (
              <li key={bond.id} className="text-sm">
                <strong className="text-orange-400">{bond.name}:</strong>
                <p className="text-xs text-zinc-300 ml-2">
                  {bond.description || "Sem descrição."}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-center text-zinc-500">
            Nenhum vínculo ativo.
          </p>
        )}
      </div>
    </>
  );
}
