import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/maxwidwrap";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from 'next/link'
import Image from "next/image";
import Navbar from '@/components/Navbar'
import withAuth from '@/components/withAuth';
interface dashboardprops {}

const dashboard: React.FC<dashboardprops> = () => {
 return (
    <>
    <Navbar/>
    <h1>hello</h1>
    </>
 );
};

export default withAuth(dashboard);