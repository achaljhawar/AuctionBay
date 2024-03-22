import { Icons } from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState,useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useRouter } from 'next/router';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

const LoginPage = () => {
    const [token, setToken] = useState(null);
    const router = useRouter()
    useEffect(() => {
        if (token) {
            router.push('/dashboard');
        }
    }, [token, router]);
    const AuthCredentialsValidator = z.object({
        email: z.string().email(),
        password: z.string().min(8, { message: "Password must be 8 characters long." })
    });

    type TAuthCredentialValidator = z.infer<typeof AuthCredentialsValidator>;

    const { register, handleSubmit, formState: { errors } } = useForm<TAuthCredentialValidator>({
        resolver: zodResolver(AuthCredentialsValidator),
    });

    const [invalidCreds, setInvalidCreds] = useState(false);
    const [servererr, setservererr] = useState(false);
    const [unregistered, setUnregistered] = useState(false);

    const onSubmit = async (data: TAuthCredentialValidator) => {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            });

            if (response.status === 200) {
                const { token } = await response.json();
                setToken(token);
                sessionStorage.setItem('token', token);                
            } else if (response.status === 401) {
                setInvalidCreds(true);
                setservererr(false);
                setUnregistered(false);
            } else if (response.status === 402) {
                setUnregistered(true);
                setInvalidCreds(false);
                setservererr(false);
            } else if (response.status === 500) {
                setservererr(true);
                setInvalidCreds(false);
                setUnregistered(false);
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
                        <h1 className="text-2xl font-bold">Sign In</h1>
                        <Link
                            className={buttonVariants({
                                variant: "link",
                            })}
                            href="/signup"
                        >
                            Don't have an account? Sign Up
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
                                <Button>Sign In</Button>
                            </div>
                        </form>
                        {invalidCreds && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    Invalid email or password.
                                </AlertDescription>
                            </Alert>
                        )}
                        {unregistered && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>
                                    You are not registered. Please sign up first.
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

export default LoginPage;