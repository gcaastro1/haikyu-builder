"use client";

import { useCharacterStore } from "@/stores/useCharacterStore";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
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
        <h1>Exercises Answers</h1>
        <p>Browse through the exercise mode questions and their possible rewards</p>
      </div>

      <div className={styles.searchContainer}>
        <div style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#71717a" }}>
            <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.list}>
        {filteredAnswers.map((answer, index) => (
          <div key={index} className={styles.card}>
            <p className={styles.question}>{answer.desc}</p>
            <div className={styles.optionsGrid}>
              <div className={styles.option}>
                <div className={styles.optionImageContainer}>
                    <Image 
                      src={`/images/answer_rewards/${answer.option1}`} 
                      alt="Option A Reward" 
                      width={64} 
                      height={64}
                      className={styles.optionImage}
                    />
                </div>
                <span className={styles.optionLabel}>OPTION A</span>
              </div>
              <div className={styles.option}>
                 <div className={styles.optionImageContainer}>
                    <Image 
                      src={`/images/answer_rewards/${answer.option2}`} 
                      alt="Option B Reward" 
                      width={64} 
                      height={64}
                      className={styles.optionImage}
                    />
                </div>
                <span className={styles.optionLabel}>OPTION B</span>
              </div>
            </div>
          </div>
        ))}
        {filteredAnswers.length === 0 && (
            <div style={{ textAlign: "center", color: "#71717a", padding: "2rem" }}>
                No exercises found matching your search.
            </div>
        )}
      </div>
    </main>
  );
}
