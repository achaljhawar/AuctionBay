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

const SignupPage = () => {
    const AuthCredentialsValidator = z.object({
        email: z.string().email(),
        password: z.string().min(8, { message: "Password must be 8 characters long." })
    });

    type TAuthCredentialValidator = z.infer<typeof AuthCredentialsValidator>;

    const { register, handleSubmit, formState: { errors } } = useForm<TAuthCredentialValidator>({
        resolver: zodResolver(AuthCredentialsValidator),
    });

    const onSubmit = async (data: TAuthCredentialValidator) => {
        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            });
            const responseData = await response.json();
            console.log(responseData);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
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
                                <div className="grid gap-1 py-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        {...register("email")}
                                        className={cn({
                                            "focus-visible:text-blue-600": errors.email,
                                        })}
                                        placeholder="gavinbelson@hooli.com"
                                    />
                                </div>
                                <div className="grid gap-1 py-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        type="password"
                                        {...register("password")}
                                        className={cn({
                                            "focus-visible:text-blue-600": errors.password,
                                        })}
                                        placeholder="Password"
                                    />
                                </div>
                                <Button>Sign Up</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignupPage;