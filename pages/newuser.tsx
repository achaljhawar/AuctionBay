"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import withAuth from "@/components/withAuth";
import { useRouter } from "next/router";
import { Toaster, toast } from 'sonner'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Minus, User2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import EditAvatar from "@/components/ui/EditAvatar";
import { useEffect, useState } from "react";

const upiIdRegex = /^[a-z0-9_.-]{3,}@[a-z]{3,}$/;

const formSchema = z.object({
  firstName: z
    .string()
    .min(5, { message: "First name must be at least 5 characters." }),
  lastName: z
    .string()
    .min(5, { message: "Last name must be at least 5 characters." }),
  shareEmail: z.boolean(),
  upiId: z.string().regex(upiIdRegex, { message: "Invalid UPI ID format" }),
  shippingAddresses: z
    .array(
      z.object({
        address: z.string().min(10, { message: "Address is required" }),
      })
    )
    .max(5, { message: "You can add up to 5 shipping addresses" }),
});

const ProfileForm = () => {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState("");
  const [hasdetails, setdetails] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      shareEmail: false,
      upiId: "",
      shippingAddresses: [{ address: "" }],
    },
  });

  useEffect(() => {
    const checkauthdetails = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("/api/auth/fetchuserdetails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          setdetails(response.ok);
        } catch (error) {
          console.error("Error verifying token:", error);
          setdetails(false);
        }
      } else {
        setdetails(false);
      }
    };

    checkauthdetails();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = {
      avatarUrl: profileImage,
      firstName: values.firstName,
      lastName: values.lastName,
      upiId: values.upiId,
      shippingAddresses: values.shippingAddresses.map(({ address }) => address),
      shareEmail: values.shareEmail,
    };
    const token = sessionStorage.getItem("token");
    const response = await fetch('/api/nwsub', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    const {message} = await response.json();
    if (response.status == 200){
      router.push("/dashboard");
    } else if (response.status == 400 ){
      toast.error(message || "An error occurred. Please try again.");
    } else if (response.status == 401) {
      toast.error(message || "An error occurred. Please try again.");
    } else if (response.status == 404 ) {
      toast.error(message || "An error occurred. Please try again.");
    } else if (response.status == 405 ) {
      toast.error(message || "An error occurred. Please try again.");
    } else if (response.status == 406 ) {
      toast.error(message || "An error occurred. Please try again.");
    } else if (response.status == 409  ) {
      toast.error(message || "An error occurred. Please try again.");
    } else if (response.status == 500  ) {
      toast.error(message || "An error occurred. Please try again.");
    } 
  }

  // If hasdetails is true, redirect to /dashboard
  if (hasdetails) {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="flex-col min-h-screen items-stretch w-full justify-center">
      <Toaster richColors  />
      <div className="py-20 flex w-full justify-center">
        <Card className="max-w-4xl w-full flex flex-col">
          <CardHeader className="text-center">
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Add your other user details to access the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex max-md:flex-col max-md:items-center gap-4">
              <Avatar className="relative h-48 w-48 max-md:h-36 max-md:w-36">
                <AvatarImage src={profileImage} />
                <AvatarFallback>
                  <User2 className="h-12 w-12" />
                </AvatarFallback>
                <EditAvatar className="absolute bottom-0 left-0 right-0 top-0 rounded-full bg-black opacity-0 transition-opacity hover:opacity-50" profileImage={profileImage} setProfileImage={setProfileImage} />
              </Avatar>
            <div className="flex-1">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="items-center rounded-lg shadow-sm">
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Bertram" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="items-center rounded-lg shadow-sm">
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Gilfoyle" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="upiId"
                    render={({ field }) => (
                      <FormItem className="items-center rounded-lg shadow-sm">
                        <FormLabel>UPI ID</FormLabel>
                        <FormControl>
                          <Input placeholder="example@upi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shippingAddresses"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center justify-between rounded-lg border p-3 shadow-sm">
                        <FormLabel>Shipping Addresses</FormLabel>
                        <FormDescription>
                          Add up to 5 shipping addresses
                        </FormDescription>
                        <div className="space-y-2">
                          {field.value.map((address, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <FormControl className="gap-2">
                                <Input
                                  placeholder={`Address ${index + 1}`}
                                  value={address.address}
                                  onChange={(e) => {
                                    const newAddresses = [...field.value];
                                    newAddresses[index] = {
                                      address: e.target.value,
                                    };
                                    field.onChange(newAddresses);
                                  }}
                                />
                              </FormControl>
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => {
                                    const newAddresses = [...field.value];
                                    newAddresses.splice(index, 1);
                                    field.onChange(newAddresses);
                                  }}
                                >
                                  <Minus />
                                </Button>
                              )}
                            </div>
                          ))}
                          {field.value.length < 5 && (
                            <Button
                              type="button"
                              onClick={() => {
                                const newAddresses = [
                                  ...field.value,
                                  { address: "" },
                                ];
                                field.onChange(newAddresses);
                              }}
                            >
                              <Plus />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="shareEmail"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5 mr-4">
                              <FormLabel>Share Email</FormLabel>
                              <FormDescription>
                                Do you want other users on our platform to see
                                your email address?
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={!profileImage}>
                    Submit
                    {!profileImage && (
                      <span className="text-red-500 ml-2">Please add an avatar</span>
                    )}
                  </Button> 
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(ProfileForm);