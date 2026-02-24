import React from "react";
import DashBoard from "./DashBoard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  console.log(session);

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
    const error = await dashBoardData.json();
    console.log("Failed to fetch dashboard data:", error);
    redirect("/");
  }

  const data = await dashBoardData.json();

  data.data.name = session.user.name;

  console.log(data);

  return (
    <div>
      <DashBoard data={data} />
    </div>
  );
};

export default page;
