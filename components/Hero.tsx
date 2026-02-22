// components/Hero.tsx  or directly in page.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import dashboard from "@/public/hero/dashboard.jpg";
import problems from "@/public/hero/problems.png";
import sheets from "@/public/hero/sheets.png";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const heroImages = [dashboard, problems, sheets];

export default function Hero() {
  return (
    <section className="relative pt-16 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Very subtle ambient glow / spotlight */}
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-amber-500/8 blur-3xl dark:opacity-60 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* LEFT ── Text + CTAs */}
          <div className="flex flex-col items-start gap-7 animate-fade-in-up">
            {/* Social proof badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-700/30 bg-amber-950/40 px-4 py-1.5 text-sm font-medium text-amber-300/90 backdrop-blur-sm">
              <Users className="h-4 w-4" />
              50,000+ coders leveling up daily
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Master{" "}
              <span className="bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                DSA
              </span>{" "}
              & Crack
              <br />
              Interviews
            </h1>

            {/* Subheadline */}
            <p className="max-w-xl text-lg leading-relaxed text-neutral-400">
              Structured sheets, handpicked problems, real contest experience —
              built by coders, for coders aiming at top tech companies.
            </p>

            {/* Buttons */}
            <div className="mt-4 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="h-12 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-base font-semibold shadow-md shadow-amber-900/30 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                asChild
              >
                <Link href="/sheets">
                  Start Practicing
                  <Code2 className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 border-amber-600/50 text-amber-300 hover:bg-amber-950/40 hover:text-amber-200 transition-all duration-300 active:scale-95"
                asChild
              >
                <Link href="/problems">
                  Explore Problems
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Small trust line */}
            <p className="mt-3 text-sm text-neutral-500">
              Trusted by students & engineers preparing for FAANG / top product
              companies
            </p>
          </div>

          {/* RIGHT ── Carousel of platform previews (hidden on mobile) */}
          <div className="hidden lg:block relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-[540px] mx-auto"
            >
              <CarouselContent>
                {heroImages.map((src, idx) => (
                  <CarouselItem key={idx}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-800 shadow-2xl shadow-black/40 bg-neutral-900/60 backdrop-blur-sm">
                      <Image
                        src={src}
                        alt={`BaseCase platform preview ${idx + 1}`}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        priority={idx === 0}
                        sizes="(min-width: 1024px) 540px, 100vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <CarouselPrevious className="-left-4 border-amber-700/40 text-amber-300 hover:bg-amber-950/60" />
              <CarouselNext className="-right-4 border-amber-700/40 text-amber-300 hover:bg-amber-950/60" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
