import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface GradeAnalytics {
  averageScore: number;
  totalGrades: number;
  gradeDistribution: { range: string; count: number }[];
  recentTrends: { date: string; averageScore: number }[];
}

export function GradeAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["gradeAnalytics"],
    queryFn: async () => {
      const { data: grades } = await supabase
        .from("grades")
        .select("score, created_at")
        .order("created_at", { ascending: true });

      if (!grades) return null;

      // Calculate average score
      const averageScore =
        grades.reduce((acc, grade) => acc + (grade.score || 0), 0) /
        grades.length;

      // Calculate grade distribution
      const distribution = grades.reduce(
        (acc: Record<string, number>, grade) => {
          if (!grade.score) return acc;
          const range = Math.floor(grade.score / 10) * 10;
          const key = `${range}-${range + 9}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        {}
      );

      const gradeDistribution = Object.entries(distribution).map(
        ([range, count]) => ({
          range,
          count,
        })
      );

      // Calculate recent trends (last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      }).reverse();

      const recentTrends = last7Days.map((date) => {
        const dayGrades = grades.filter(
          (grade) =>
            new Date(grade.created_at).toISOString().split("T")[0] === date
        );
        const averageScore =
          dayGrades.length > 0
            ? dayGrades.reduce((acc, grade) => acc + (grade.score || 0), 0) /
              dayGrades.length
            : 0;
        return {
          date,
          averageScore: Math.round(averageScore * 100) / 100,
        };
      });

      return {
        averageScore: Math.round(averageScore * 100) / 100,
        totalGrades: grades.length,
        gradeDistribution,
        recentTrends,
      };
    },
  });

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div>No grade data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
            <CardDescription>Overall student performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageScore}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Grades</CardTitle>
            <CardDescription>Number of grades recorded</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalGrades}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
          <CardDescription>Distribution of grades by range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                grade: {
                  theme: {
                    light: "#0ea5e9",
                    dark: "#0ea5e9",
                  },
                },
              }}
            >
              <BarChart data={analytics.gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <ChartTooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      labelKey="range"
                    />
                  )}
                />
                <Bar dataKey="count" name="Students" fill="var(--color-grade)" />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trends</CardTitle>
          <CardDescription>Average scores over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                trend: {
                  theme: {
                    light: "#0ea5e9",
                    dark: "#0ea5e9",
                  },
                },
              }}
            >
              <LineChart data={analytics.recentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      labelKey="date"
                    />
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="averageScore"
                  name="Average Score"
                  stroke="var(--color-trend)"
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}