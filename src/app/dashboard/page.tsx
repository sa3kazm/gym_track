import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata = {
  title: "Підсумок | Gym Track",
  description: "Аналіз тіла, BMI, BMR, McCallum та Fitness Score",
};

export default function DashboardPage() {
  return <DashboardView />;
}
