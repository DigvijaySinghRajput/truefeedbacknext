"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message } from "@/model/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import MessageSkeleton from "@/components/messageSkeleton";
import MessageCard from "@/components/message";
import { string } from "zod";
function page() {
  const [message, setMessage] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const handleDeleteMessage = (messageId: string) => {
    setMessage(message.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessage = watch("acceptMessage");

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptMessage", response.data.isAcceptingMessage ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast("Error", {
        description: (
          <span className="text-foreground">
            {axiosError.response?.data.message} || "Failed to fetch message
            setting"
          </span>
        ),
        className: "bg-background text-black border border-red-700",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        console.log(response);
        setMessage(response.data.messages || []);
        if (refresh) {
          toast("Refreshed Message", {
            description: (
              <span className="text-foreground ">Showing latest messages</span>
            ),
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast("Error", {
          description: (
            <span className="text-foreground">
              {axiosError.response?.data.message} || "Failed to fetch message
              setting"
            </span>
          ),
          className: "bg-background text-black border border-red-700",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, setMessage]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchAcceptMessage();
    fetchMessages();
  }, [session, setValue, fetchAcceptMessage, fetchMessages]);

  //handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessage: !acceptMessage,
      });
      setValue("acceptMessage", !acceptMessage);
      toast(`${response.data.message}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast("Error", {
        description: (
          <span className="text-black">
            {axiosError.response?.data.message} || "Failed to fetch message
            setting"
          </span>
        ),
        className: "bg-red-600 text-black border border-red-700",
      });
    }
  };

  if (!session || !session.user) {
    return <div></div>;
  }

  const { username } = session?.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/dm/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast("URL copied", {
      description: (
        <span className="text-black">
          Profile URL copied to Clipboard Successfully
        </span>
      ),
    });
  };

  return (
    <div className="bg-background min-h-screen pt-20 py-8 px-4 md:px-8">
      <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6  bg-card rounded w-full max-w-7xl">
        <h1 className="text-4xl text-foreground font-bold mb-4">
          User Dashboard
        </h1>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
          <div className="flex items-center">
            <input
              type="text"
              value={profileUrl}
              disabled
              className="input input-bordered w-2xs p-2 mr-2 border-2 border-border"
            />
            <Button onClick={copyToClipboard}>Copy</Button>
          </div>
        </div>

        <div className="mb-4">
          <Switch
            {...register("acceptMessage")}
            checked={acceptMessage}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <span className="ml-2">
            Accept Messages: {acceptMessage ? "On" : "Off"}
          </span>
        </div>
        <Separator />

        <Button
          className="mt-4"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, index) => <MessageSkeleton key={index} />)
          ) : message.length > 0 ? (
            message.map((message, index) => (
              <MessageCard
                key={String(message._id)}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <p>No Messages To Display</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default page;
