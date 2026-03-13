import { HarmonyAppShell } from "@/components/harmony/HarmonyAppShell";
import { HomeCommandCenter } from "@/components/harmony/HomeCommandCenter";

const HomePage = () => (
  <HarmonyAppShell searchPlaceholder="Search payments, proposals, positions…">
    <HomeCommandCenter />
  </HarmonyAppShell>
);

export default HomePage;
