import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import {auth} from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
    // verifying the user
    const session = await auth.api.getSession({
        headers : await headers(),
    });

    if(!session || !session.user){
        return NextResponse.json({
            success : false,
            data : null,
            message : "Unauthorized",            
        },
    {status : 401});
    }
    // this is the route for providing the information of previous interviews 
    const data = await prisma.interview.findMany({
        where : {
            userId : session.user.id,
        },
        include : {
            feedback : {
                select : {
                    overallScore : true,
                }
            }
        },
        orderBy : {
            startedAt : "desc",
        }
    });

    return NextResponse.json({
        success : true,
        data , 
        message : "Previous interviews fetched successfully",
    })
}