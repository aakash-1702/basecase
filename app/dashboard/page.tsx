import React from 'react'
import DashBoard from './DashBoard'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const page = async () => {
  const session = await auth.api.getSession({
    headers  : await headers(),
  });

  if(!session){
    redirect("/auth/sign-in");
  }
  return (
    <div>
      <DashBoard />
    </div>
  )
}

export default page
