import MaxWidthWrapper from "./maxwidwrap";
import Link from "next/link";
import { Icons } from "./Icons";
import { buttonVariants } from "./ui/button";
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { Span } from "next/dist/trace";


const Navbar = () => {
    const user = null;
    return (
        <div className="bg-white sticky z-50 top-0 inset-x-0 h-16">
            <header className="relative bg-white">
                <div className="flex h-16 items-center justify-between">
                    <div className="lg:ml-0.5">
                        <Link href="/">
                            <Icons.logo className="h-20 w-20" />
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <div className="hidden lg:flex lg:items-center lg:space-x-6 mr-4">
                            {user ? null : (
                            <Link
                            href='/signin'
                            className={buttonVariants({
                            variant: 'ghost',
                            })}>
                            Login
                            </Link>
                            )}
                            {user ? null: <span className="h-6 w-px bg-gray-200" aria-hidden='true'></span>}
                            {user ? (
                                <p></p>
                            ) : (
                            <Link href='/signup' className={buttonVariants({variant: 'ghost'})}> Create account </Link>
                            )}
                            {user ? <span className="h-6 w-px bg-gray-200" aria-hidden='true'></span> : null}
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Navbar;