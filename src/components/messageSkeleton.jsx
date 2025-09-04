"use client";
import React from "react";
import { Skeleton } from "./ui/skeleton";
import { Card, CardHeader, CardTitle } from "./ui/card";

function messageSkeleton() {
  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <div className="flex justify-between items-top">
          <div className="flex-1 pr-4 space-y-4">
            <Skeleton className="h-5 w-full bg-gray-300" />
            <Skeleton className="h-5 w-3/4 bg-gray-300" />
            <Skeleton className="h-5 w-1/2 bg-gray-300" />
          </div>

          <Skeleton className="w-5 h-5 bg-gray-300" />
        </div>
        <div className="flex">
          <Skeleton className="h-4 w-32 bg-gray-300" />
        </div>
      </CardHeader>
    </Card>
  );
}

export default messageSkeleton;
