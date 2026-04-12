import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { getInterviewDetails } from "@/lib/session";
import { success } from "zod";
export async function PATCH(req: NextRequest) {
  // updating data in redis cache , giving response and doing the tts for sending it to the frontend
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(!session?.user){
    return NextResponse.json({
        success : false,
        data : null,
        message : "Unauthorized",
    },{
        status : 401    
    });
  }


  const {interviewId , userResponse} = await req.json();

  if(!interviewId || !userResponse){
    return NextResponse.json({
        success : false,
        data : null,
        message : "Invalid request body, interviewId and userResponse are required",
    },{
        status : 400    
    });
  }

  // need to check if the interview exists or not or if has already been completed by the user
  const interviewIdExists = await prisma.interview2.findFirst({
    where : {
        id : interviewId , 
        userId : session.user.id,
        status : "IN_PROGRESS",
    },
    select: {
        id : true,
    }
  });

  if(!interviewIdExists){
    return NextResponse.json({
        success : false,
        data : null,
        message : "Interview not found or already completed",
    },{
        status : 404
    });
  }


  // fetch the existing interview details from redis
  const interviewDetails = await getInterviewDetails(interviewId , session.user.id);

  if(!interviewDetails){
    return NextResponse.json({
        success : false,
        data : null,
        message : "Interview details not found for the given interviewId",
    },{
        status : 404
    })
  }


  // now decide what should be done next in the interview
 const nextAIAction = getNextAction(interviewDetails )


  
  
  


  




  


}
