import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import React from 'react'
import { redirect } from 'next/navigation'
import ComingSoonPage from '@/components/ComingSoon'

const page = async () => {
    const session = await auth.api.getSession({
        headers : await headers(),
    });

    if(!session || !session?.user){
        redirect("/auth/sign-in");
    }

  return (
    <div>
        <ComingSoonPage />
      
    </div>
  )
}

export default page
