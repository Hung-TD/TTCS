import React, { useState, useEffect } from "react";
import styles from "./interactiveCalendar.module.css";

interface CalendarProps {
  selectedDate: string;
  onDayClick: (date: string) => void;
  goals: { [key: string]: string };
  notes: { [key: string]: string };
}

const InteractiveCalendar: React.FC<CalendarProps> = ({ selectedDate, onDayClick, goals, notes }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000 * 60 * 60 * 24);

    return () => clearInterval(interval);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = selectedMonth;
    const firstDay = getFirstDayOfMonth(year, month);
    const totalDays = daysInMonth(year, month);

    const daysArray = [];
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className={styles.empty}></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === new Date().toISOString().slice(0, 10);
      const hasContent = goals[dateStr] || notes[dateStr];

      daysArray.push(
        <button
          key={day}
          className={`${styles.day} ${isSelected ? styles.selected : ""} ${hasContent ? styles.hasContent : ""} ${isToday ? styles.today : ""}`}
          onClick={() => onDayClick(dateStr)}
        >
          {day}
        </button>
      );
    }

    return daysArray;
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.monthHeader}>
        <span>{currentDate.getFullYear()}</span>
      </div>

      <div className={styles.months}>
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, index) => (
          <span key={index} className={styles.month} onClick={() => setSelectedMonth(index)}>
            {m}
          </span>
        ))}
      </div>

      <div className={styles.underline}></div>

      <div className={styles.daysHeader}>
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
          <div key={d} className={styles.dayName}>{d}</div>
        ))}
      </div>

      <div className={styles.daysGrid}>{renderCalendar()}</div>
    </div>
  );
};

export default InteractiveCalendar;