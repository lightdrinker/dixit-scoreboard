import { createFileRoute } from "@tanstack/react-router";
import { DixitApp } from "@/components/dixit-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <DixitApp />;
}
