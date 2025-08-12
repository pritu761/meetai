"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { OctagonAlertIcon } from "lucide-react"
import { Alert } from "@/components/ui/alert"
import Link from "next/link"
import { useRouter } from "next/dist/client/components/navigation"
import { authClient } from "@/lib/auth-client"
import React from "react"
import { auth } from "@/lib/auth"
import {FaGithub, FaGoogle} from "react-icons/fa"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
})

export const SignInView = () => {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [pending,setPending] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);
    const {error} = await authClient.signIn.email({
      email: values.email,
      password: values.password
    },
  {
   onSuccess: () => {
     setPending(false)
     router.push("/")
   },
   onError: ({error}) => {
     setPending(false);
     setError(error.message)
   },
  })

  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
                  <p className="text-muted-foreground text-center text-balance">
                    Please sign in to your account
                  </p>
                </CardHeader>
                <CardContent className="p-0 flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="•••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!!error && (
                    <Alert className="bg-destructive/10 border-none">
                      <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                      {error}
                    </Alert>
                  )}
                </CardContent>
                <CardFooter className="p-0 flex-col gap-4">
                  <Button disabled={pending} type="submit" className="w-full">Sign In</Button>
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <Button disabled={pending} type="button" onClick={() => authClient.signIn.social({
                      provider: "google",
                    })} variant="outline">
                      <FaGoogle className="mr-2 h-4 w-4" />
                      
                    </Button>
                    <Button disabled={pending} type="button" onClick={() => authClient.signIn.social({
                      provider: "github"
                    })} variant="outline">
                      <FaGithub className="mr-2 h-4 w-4" />
                      
                    </Button>
                  </div>
                </CardFooter>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/sign-up" className="font-semibold text-primary">
                    Sign up
                  </Link>
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  By clicking continue, you agree to our{" "}
                  <Link href="/terms-of-service" className="underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </Form>
          </div>
          <div className="bg-radial from-green-700 to-gray-900 relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            <img src="/logo.svg" alt="Image" className="w-24" />
            <p className="text-2xl font-semibold text-white">
              Meetai
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
