import { AccessGate } from "@/components/admin/access-gate";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccessGate>{children}</AccessGate>;
}
