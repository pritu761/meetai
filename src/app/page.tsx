import { HomeView } from "@/modules/auth/ui/views/home/ui/views/home-view";
import {redirect} from "next/navigation";
import {auth} from "@/lib/auth";
import {headers} from "next/headers"

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if(!session){
    redirect("/sign-in")
  }
  return (
    <div>
      <HomeView />
    </div>
  );
};

export default Page;
