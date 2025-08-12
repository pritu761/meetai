"use client"

import {authClient} from "@/lib/auth-client"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const HomeView = () =>{
  const {data:session} = authClient.useSession()
  const router = useRouter()
  if(!session){
     return(
            <div>Loading...</div>
        )
    }
  return (
    <div className="flex flex-col p-4 gap-y-4">
      {session ? (
        <p>Welcome back, {session.user.email}!</p>
      ) : (
        <p>Please sign in to access your account.</p>
      )}
      <Button onClick={() => authClient.signOut({
        fetchOptions:{
           onSuccess : async () => { await router.push("sign-in") }
        }
      })}>Sign Out</Button>
    </div>
  )
}


