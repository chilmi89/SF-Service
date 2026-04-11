import LayoutProvider from "@/components/LayoutProvider";

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutProvider>{children}</LayoutProvider>;
}
