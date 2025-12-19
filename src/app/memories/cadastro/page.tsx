import { getMemoryImages } from "@/app/actions/getMemoryImages";
import { MemoryForm } from "./MemoryForm";

export const dynamic = 'force-dynamic';

export default async function MemoryCadastroPage() {
  const { images, error } = await getMemoryImages();

  return (
    <MemoryForm 
      initialImages={images || []}
      loadError={error || null}
    />
  );
}
