import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/modules/dashboard/ui/components/dasboard-navbar";
import { DashboardSidebar } from "@/modules/dashboard/ui/components/dasboard-sidebar";

interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen bg-muted">
        <DashboardSidebar />
        <main className="flex flex-1 flex-col">
          <DashboardNavbar />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
