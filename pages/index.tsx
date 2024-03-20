import { useEffect, useState } from "react";
import MaxWidthWrapper from "@/components/maxwidwrap";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from 'next/link'
import Image from "next/image";
import Navbar from '@/components/Navbar'
interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {
 return (
  <>
    <Navbar/>
    <MaxWidthWrapper>
      <div className="flex-1 py-20 mx-auto text-center flex flex-col items-center max-w-3xl">
        <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
          Your marketplace for effortless{' '}
          <span className='text-blue-600'>
          buying and selling
          </span>
          .
        </h1>
        <p className='mt-6 text-lg max-w-prose text-muted-foreground'>
          Welcome to our bustling auction site, where every bid opens a door 
          to endless possibilities! Whether you're buying or selling, dive into 
          the excitement and find treasures waiting to be discovered. 
          Start your journey with us today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button variant="ghost">Browse Auctions &rarr;</Button>
        </div>
      </div>
      <div className="flex-1 max-lg:hidden">
        <Image src ="hero.svg" alt = "hero image" width={1000} height = {1000}>
        </Image>
      </div>
    </MaxWidthWrapper>
  </>
 );
};

export default HomePage;