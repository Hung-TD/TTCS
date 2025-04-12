"use client";

import React, { useState, useEffect } from "react";
import Calendar from "../../InteractiveCalendar/page";
import styles from "./calendarPage.module.css";
import Header from "../../HeaderLayout/page";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { firestore, auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [goals, setGoals] = useState<{ [key: string]: string }>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);

        // Dùng hàm async riêng để dùng await
        const fetchGoals = async () => {
          try {
            const userRef = doc(firestore, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const data = userSnap.data();
              if (data.goals) setGoals(data.goals);
              if (data.notes) setNotes(data.notes);
            }
          } catch (error) {
            console.error("Lỗi khi lấy dữ liệu goals:", error);
          }
        };

        fetchGoals();
      } else {
        setUserId(null);
        setGoals({});
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGoals({ ...goals, [selectedDate]: e.target.value });
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes({ ...notes, [selectedDate]: e.target.value });
  };  

  const handleSaveGoal = async () => {
    if (!selectedDate) {
      alert("Please select a date before saving.");
      return;
    }
  
    if (!userId) {
      alert("User not logged in.");
      return;
    }
  
    const selectedGoal = goals[selectedDate];
    const selectedNote = notes[selectedDate];
  
    // ✅ Nếu cả goal và note đều trống thì không cho lưu
    if (
      (!selectedGoal || selectedGoal === "no_goal") &&
      (!selectedNote || selectedNote.trim() === "")
    ) {
      alert("Please enter a goal or a note before saving.");
      return;
    }
  
    try {
      const userRef = doc(firestore, "users", userId);
      const updates: any = {};
  
      if (selectedGoal && selectedGoal !== "no_goal") {
        updates[`goals.${selectedDate}`] = selectedGoal;
      } else {
        updates[`goals.${selectedDate}`] = null; // huỷ goal nếu chọn "No Goal"
      }
  
      if (selectedNote && selectedNote.trim() !== "") {
        updates[`notes.${selectedDate}`] = selectedNote.trim();
      } else {
        updates[`notes.${selectedDate}`] = null;
      }
  
      await updateDoc(userRef, updates);
      alert("Saved successfully!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save.");
    }
  };
  

  const ieltsScores = Array.from({ length: 13 }, (_, i) =>
    (3 + i * 0.5).toFixed(1)
  );

  return (
    <div className={styles.pageContainer}>
      <Header />
      <h1 className={styles.title}>My Calendar</h1>

      <div className={styles.mainContent}>
        <div className={styles.calendarWrapper}>
          <Calendar
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
            goals={goals}
            notes={notes}
          />
        </div>

        {selectedDate && (
          <div className={styles.sidePanel}>
            <div className={styles.panelSection}>
              <h2>Set Your IELTS Goal</h2>
              <select
                value={goals[selectedDate] || ""}
                onChange={handleGoalChange}
                className={styles.dropdown}
              >
                <option value="">Select Band Score</option>
                <option value="no_goal">No Goal</option> {/* 👈 Thêm tùy chọn này */}
                {ieltsScores.map((score) => (
                  <option key={score} value={score}>
                    {score}
                  </option>
                ))}
              </select>
              
              <textarea
                placeholder="Write your note here..."
                value={notes[selectedDate] || ""}
                onChange={handleNoteChange}
                className={styles.textarea}
              />

              <button onClick={handleSaveGoal} className={styles.saveButton}>
                Save Goal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
