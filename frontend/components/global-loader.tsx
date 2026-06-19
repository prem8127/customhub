"use client";

import Image from "next/image";
import {
  BatteryCharging,
  Bike,
  Key,
  Shirt,
  Smartphone,
  Sticker
} from "lucide-react";

import customHubLogo from "@/Categories images/CustomHublogo.png";

const loaderIcons = [Shirt, Smartphone, Bike, Sticker, Key, BatteryCharging];

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[linear-gradient(180deg,#fff8fa_0%,#f7eaee_100%)]">
      <div className="flex w-full max-w-md flex-col items-center px-6 text-center">
        <Image
          src={customHubLogo}
          alt="CustomHub loading"
          priority
          className="h-[15.6rem] w-[15.6rem] object-contain md:h-[19.5rem] md:w-[19.5rem]"
        />

        <div className="relative mt-6 inline-flex text-[1.35rem] font-medium tracking-[-0.02em] text-ink">
          <span>CustomHub</span>
          <span className="absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[0.6rem] font-semibold leading-none text-white shadow-sm">
            24
          </span>
        </div>
        <p className="mt-2 text-sm font-medium text-steel/80">Loading...</p>

        <div className="loader-icons mt-6" aria-hidden="true">
          <div className="loader-icons__track">
            {[0, 1].map((duplicate) => (
              <div key={duplicate} className="loader-icons__segment">
                {loaderIcons.map((Icon, index) => (
                  <span
                    key={`${duplicate}-${index}`}
                    className="loader-icons__chip"
                    style={{ animationDelay: `${index * 0.14}s` }}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.9} />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
