import { Icons } from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Send,AlertCircle } from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
  } from "@/components/ui/alert"

  const SignupPage = () => {
    const AuthCredentialsValidator = z.object({
        email: z.string().email(),
        password: z.string().min(8, { message: "Password must be 8 characters long." })
    });

    type TAuthCredentialValidator = z.infer<typeof AuthCredentialsValidator>;

    const { register, handleSubmit, formState: { errors } } = useForm<TAuthCredentialValidator>({
        resolver: zodResolver(AuthCredentialsValidator),
    });

    const [showAlert, setShowAlert] = useState(false);
    const [alruser, setalruser] = useState(false);
    const [servererr, setservererr] = useState(false);
    const [databaseerr, setdatabaseerr] = useState(false);
    const onSubmit = async (data: TAuthCredentialValidator) => {
        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            });
            if (response.status === 200) {
                setShowAlert(true);
                setalruser(false);
                setservererr(false);
                setdatabaseerr(false);
            } else if (response.status === 400){
                setalruser(true);
                setShowAlert(false);
                setservererr(false);
                setdatabaseerr(false);
            } else if (response.status === 500){
                setservererr(true);
                setShowAlert(false);
                setalruser(false);
                setdatabaseerr(false);
            } else if (response.status === 501){
                setdatabaseerr(true);
                setShowAlert(false);
                setalruser(false);
                setservererr(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0 lg:mt-0">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col items-center space-y-2 text-center">
                        <Icons.logo className="h-20 w-20" />
                        <h1 className="text-2xl font-bold">Create an account</h1>
                        <Link
                            className={buttonVariants({
                                variant: "link",
                            })}
                            href="/signin"
                        >
                            Already have an account? Sign-In
                        </Link>
                    </div>
                    <div className="grid gap-6">
                        <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-2">
                            <div className="grid gap-3 py-2">
                                <Label htmlFor="email">
                                    Email
                                </Label>
                                <Input
                                    {...register("email")}
                                    placeholder="gavinbelson@hooli.com"
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                            </div>
                            <div className="grid gap-3 py-2">
                                <Label htmlFor="password">
                                    Password
                                </Label>
                            <Input
                                type="password"
                                {...register("password")}
                                placeholder="Password"
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                            </div>
                            <Button>Sign Up</Button>
                        </div>
                        </form>
                        {showAlert && (
                            <Alert>
                                <Send className="w-4 h-4" />
                                <AlertTitle>Heads up!</AlertTitle>
                                <AlertDescription>
                                    Check your email inbox for the verification link to activate your account.
                                </AlertDescription>
                            </Alert>
                        )}
                        {alruser && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    This email is already registered.
                                </AlertDescription>
                            </Alert>
                        )}
                        {databaseerr && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    Database Error
                                </AlertDescription>
                            </Alert>
                        )}
                        {servererr && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    Internal Server Error
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignupPage;