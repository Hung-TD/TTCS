"use client";

import React, { useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import styles from "./scorePage.module.css";
import Header from "../../../components/HeaderLayout/page";
import { getUserScores } from "@/services/scoreService";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"];

const ScorePage: React.FC = () => {
  const [allTimeData, setAllTimeData] = useState<any[]>([]);
  const [last30DaysData, setLast30DaysData] = useState<any[]>([]);

  useEffect(() => {
    const fetchScores = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userData = await getUserScores(user.uid);

      if (userData) {
        const formatScore = (scoreObj: any) => [
          { name: "Grammatical Range & Accuracy", value: scoreObj.grammaticalRangeAccuracy },
          { name: "Coherence & Cohesion", value: scoreObj.coherenceCohesion },
          { name: "Lexical Resource", value: scoreObj.lexicalResource },
          { name: "Task Achievement", value: scoreObj.taskAchievement },
        ];

        if (userData.lastScore) setAllTimeData(formatScore(userData.lastScore));
        if (userData.last30DaysScores?.[0]) setLast30DaysData(formatScore(userData.last30DaysScores[0]));
      }
    };

    fetchScores();
  }, []);

  const renderChart = (data: any[], title: string) => (
    <div className={styles.chartContainer}>
        <Header />
      <h2 className={styles.chartTitle}>{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie dataKey="value" isAnimationActive={true} data={data} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className={styles.container}>
      {allTimeData.length > 0 && renderChart(allTimeData, "All-Time IELTS Score Breakdown")}
      {last30DaysData.length > 0 && renderChart(last30DaysData, "Last 30 Days Score Breakdown")}
    </div>
  );
};

export default ScorePage;
