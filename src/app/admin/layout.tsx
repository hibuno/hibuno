import { AccessGate } from "@/components/admin/access-gate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccessGate>{children}</AccessGate>;
}
