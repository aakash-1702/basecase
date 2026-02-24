import React from 'react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Sheets from './Sheets'

const page = async () => {
    const session = await auth.api.getSession({
        headers : await headers(),
    })

    if(!session || !session?.user){
        redirect("/auth/sign-in");        
    }
  return (
    <div>
        <Sheets />
      
    </div>
  )
}

export default page
