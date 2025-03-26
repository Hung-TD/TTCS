import React, { useState, useEffect } from "react";
import styles from "./calendar.module.css";

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000 * 60 * 60 * 24); // Cập nhật mỗi ngày

    return () => clearInterval(interval);
  }, []);

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (month: number) => {
    setSelectedMonth(month);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = selectedMonth;
    const todayDate = currentDate.getDate();
    const todayMonth = currentDate.getMonth();
    const firstDay = getFirstDayOfMonth(year, month);
    const totalDays = daysInMonth(year, month);

    const daysArray = [];
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(<div key={`empty-${i}`} className={styles.empty}></div>);
    }
    for (let i = 1; i <= totalDays; i++) {
      daysArray.push(
        <div
          key={i}
          className={`${styles.day} ${i === todayDate && month === todayMonth ? styles.today : ""}`}
        >
          {i}
        </div>
      );
    }
    return daysArray;
  };

  return (
    <div className={styles.calendarContainer}>
      {/* Header năm */}
      <div className={styles.monthHeader}>
        <span>{currentDate.getFullYear()}</span>
      </div>

      {/* Danh sách tháng có thể ấn để thay đổi lịch */}
      <div className={styles.months}>
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
          (m, index) => (
            <span
              key={index}
              className={styles.month}
              onClick={() => changeMonth(index)}
            >
              {m}
            </span>
          )
        )}
      </div>

      {/* Đường kẻ nhỏ dưới danh sách tháng */}
      <div className={styles.underline}></div>

      {/* Header ngày trong tuần */}
      <div className={styles.daysHeader}>
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
          <div key={d} className={styles.dayName}>
            {d}
          </div>
        ))}
      </div>

      {/* Hiển thị ngày */}
      <div className={styles.daysGrid}>{renderCalendar()}</div>
    </div>
  );
};

export default Calendar;
