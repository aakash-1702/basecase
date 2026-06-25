"use client";

import { Button } from "@/components/ui/button";
import { Globe, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MakePublicButtonProps {
  roadmapId: string;
}

export function MakePublicButton({ roadmapId }: MakePublicButtonProps) {
  const handleMakePublic = async () => {
    // TODO: Implement API call to make roadmap public
    const response = await fetch(`/api/roadmap/${roadmapId}/roadmap-changes`,{
      method : "PATCH",
      headers : {
        "Content-type" : "application/json",
      },
      body : JSON.stringify({
        status : "PUBLIC",
      })
    });
    
  };



  return (
    <Button
      variant="outline"
      onClick={handleMakePublic}
      className={cn(
        "group",
        "bg-amber-500/10 border-amber-500/30 text-amber-400",
        "hover:bg-amber-500 hover:border-amber-500 hover:text-black",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5",
        "active:translate-y-0 active:shadow-none"
      )}
    >
      <Globe className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
      Make Public
      <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-0.5" />
    </Button>
  );
}
