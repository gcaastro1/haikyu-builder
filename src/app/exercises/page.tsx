"use client";

import { useCharacterStore } from "@/stores/useCharacterStore";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./Exercises.module.scss";

export default function ExercisesPage() {
  const { allExerciseAnswers, fetchInitialData } = useCharacterStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredAnswers = allExerciseAnswers.filter((answer) =>
    answer.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1>Respostas dos Exercícios</h1>
        <p>Consulte as perguntas do modo exercício e suas possíveis recompensas</p>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.searchIconWrapper}>
            <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Pesquisar exercícios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.list}>
        <AnimatePresence>
        {filteredAnswers.map((answer, index) => (
          <motion.div 
            key={index} 
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <p className={styles.question}>{answer.desc}</p>
            <div className={styles.optionsGrid}>
              <div className={styles.option}>
                <div className={styles.optionImageContainer}>
                    <Image 
                      src={`/images/answer_rewards/${answer.option1}`} 
                      alt="Recompensa Opção A" 
                      width={64} 
                      height={64}
                      className={styles.optionImage}
                      unoptimized
                    />
                </div>
                <span className={styles.optionLabel}>OPÇÃO A</span>
              </div>
              <div className={styles.option}>
                 <div className={styles.optionImageContainer}>
                    <Image 
                      src={`/images/answer_rewards/${answer.option2}`} 
                      alt="Recompensa Opção B" 
                      width={64} 
                      height={64}
                      className={styles.optionImage}
                      unoptimized
                    />
                </div>
                <span className={styles.optionLabel}>OPÇÃO B</span>
              </div>
            </div>
          </motion.div>
        ))}
        </AnimatePresence>
        {filteredAnswers.length === 0 && (
            <div className={styles.emptyState}>
                Nenhum exercício encontrado.
            </div>
        )}
      </div>
    </main>
  );
}
