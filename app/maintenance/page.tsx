import type { Metadata } from "next";
import { MaintenanceScreen } from "@/components/maintenance-screen";

export const metadata: Metadata = {
  title: "Maintenance",
  robots: { index: false, follow: false },
};

export default function MaintenanceRoute() {
  return <MaintenanceScreen />;
}
