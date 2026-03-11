import React from "react";
import type { Metadata } from "next";
import DashBoard from "./DashBoard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard — BaseCase",
  description: "Track your coding progress, revision schedule, and sheet completion.",
};

const page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  const dashBoardData = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: (await headers()).get("cookie") ?? "", // forward the session cookie
      },
      cache: "no-store",
    },
  );

  if (!dashBoardData.ok) {
    redirect("/");
  }

  const data = await dashBoardData.json();

  data.data.name = session.user.name;

  return (
    <div>
      <DashBoard data={data} />
    </div>
  );
};

export default page;

