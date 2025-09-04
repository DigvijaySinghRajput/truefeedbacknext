"use client";

import { Button } from "@/components/ui/button";
import { useCompletion } from "@ai-sdk/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const HardcodedValue =
  "What's your biggest dream?||What makes you laugh the most?||If you could learn any skill, what would it be?";

const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

function SendMessage() {
  const [issending, setIssending] = useState(false);
  const param = useParams<{ username: string }>();
  const {
    complete,
    completion,
    error,
    isLoading: isgenerating,
  } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: HardcodedValue,
  });
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: "", createdAt: new Date() },
  });

  if (!param?.username) return <div>Loading...</div>;

  const onSubmit = async () => {
    try {
      toast("Generating Message", {
        description: `Fetching Message`,
      });
      complete("");
      toast("Getting Messages", {
        description: `Messages are being Generated`,
      });
    } catch (error) {
      toast("Error ", {
        description: "Error generating message",
      });
    }
  };

  const onsubmit = async (data: z.infer<typeof messageSchema>) => {
    console.log("Form submitted with data:", data); // Debug log
    setIssending(true);
    try {
      const message = { username: param.username, content: data.content };
      console.log("Submitting message to:", param.username, data.content);

      const response = await axios.post<ApiResponse>(
        "/api/send-message",
        message
      );
      console.log("API hit:", response.data);

      if (response.status === 200) {
        toast("Success", {
          description: response.data.message,
          className: "bg-green-600 text-black border border-red-700",
        });
      } else {
        toast("Failed", {
          description: response.data.message,
          className: "bg-red-600 text-black border border-red-700",
        });
      }

      // Reset form after successful submission
      form.reset();
    } catch (error) {
      console.error("Error sending message", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast("Message Not Sent", {
        description: axiosError.response?.data.message,
        className: "bg-red-600 text-black border border-red-700",
      });
    } finally {
      setIssending(false);
    }
  };

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };
  return (
    <div className="container mx-auto my-8 p-6 bg-background rounded max-w-4xl">
      <h1 className="text-5xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-1xl">
                  Send Anonymous Message to @{param.username}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none text-2xl"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {issending ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={issending}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>
      <div className="space-y-4 my-8">
        <div className="space-y-2">
          {isgenerating ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button onClick={onSubmit} disabled={isgenerating}>
              Generate Message
            </Button>
          )}
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {error ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              parseStringMessages(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SendMessage;
