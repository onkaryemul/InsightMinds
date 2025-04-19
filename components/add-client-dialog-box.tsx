// "use client"

// import * as React from "react"
// import { X } from 'lucide-react'
// import { Button } from "@/components/ui/button"
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select"
// import { Plus } from "lucide-react"
// import { useState, FormEventHandler } from 'react';
// // import { supabase } from '@/lib/supabase';
// import { createClient } from "@/utils/supabase/client"
// import { useRouter } from 'next/navigation';

// // interface AddClientDialogProps {
// //     trigger?: React.ReactNode
// // }

// const supabase = createClient();
// interface AddClientDialogProps {
//     onClose: () => void;  // Callback function
// }

// export function AddClientDialogBox({ onClose }: AddClientDialogProps) {
//     const router = useRouter();
//     // const [isOpen, setIsOpen] = useState(false);
//     const [firstName, setFirstName] = React.useState("");
//     const [lastName, setLastName] = React.useState("");
//     const [pronouns, setPronouns] = React.useState("");
//     const [email, setEmail] = React.useState("");
//     const [phone, setPhone] = React.useState("");

//     const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
//         event.preventDefault()
//         const formData = new FormData(event.currentTarget)

//         const fullName = `${firstName} ${lastName}`; // Add space between names

//         if (!email || !fullName || !phone || !pronouns) {
//             console.error("Missing required fields");
//             return;
//         }

//         try {
//             // First create a profile
//             const { data: profile, error: profileError } = await supabase
//                 .from('profiles')
//                 .insert({
//                     // id: '3a1dfa40-20e6-45f9-a5a7-cc46d7038e92',
//                     email,
//                     full_name: fullName,
//                     role: 'client'
//                 })
//                 .select()
//                 .single();

//             if (profileError) {
//                 console.error("Error inserting into profiles:", profileError.message);
//                 return;
//             }

//             // Insert into 'clients'
//             const user = await supabase.auth.getUser();
//             const therapistId = user.data?.user?.id;

//             if (!therapistId) {
//                 console.error("Therapist ID is missing");
//                 return;
//             }

//             const { error: clientError } = await supabase
//             .from("clients")
//             .insert({
//                 profile_id: profile.id,
//                 therapist_id: therapistId,
//                 phone_number: phone,
//                 pronouns: pronouns, // ✅ Fixed pronouns issue
//                 status: "active",
//             });

//             if (clientError) {
//                 console.error("Error inserting into clients:", clientError.message);

//                 // ❌ Rollback: Delete the created profile if client insertion fails
//                 await supabase.from('profiles').delete().eq('id', profile.id);
//                 return;
//             } 

//             // ✅ Refresh UI and close modal
//             router.refresh();
//             onClose();
//         }
//         catch (error) {
//             console.error("Unexpected error:", error);
//         }
//     };

//     return (
//         <Dialog open onOpenChange={onClose}>
//             <DialogTrigger asChild>
//                 <Button variant="default">
//                     <Plus className="mr-2 h-4 w-4" /> Add Client
//                 </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
//                 <DialogHeader>
//                     <DialogTitle>Add New Client</DialogTitle>
//                     <DialogDescription id="add-client-description">
//                         Fill out the form below to create a new client and link them to the therapist.
//                     </DialogDescription>
//                 </DialogHeader>
//                 <form onSubmit={handleSubmit} className="space-y-4 py-4">
//                     <div className="space-y-4">
//                         <div>
//                             <Input
//                                 required
//                                 name="firstName"
//                                 placeholder="First Name *"
//                                 value={firstName}
//                                 onChange={(e) => setFirstName(e.target.value)}
//                                 className="w-full"
//                             />
//                         </div>
//                         <div>
//                             <Input
//                                 required
//                                 name="lastName"
//                                 placeholder="Last Name *"
//                                 value={lastName}
//                                 onChange={(e) => setLastName(e.target.value)}
//                                 className="w-full"
//                             />
//                         </div>
//                         <div>
//                             <Input
//                                 required
//                                 name="email"
//                                 type="email"
//                                 placeholder="Email *"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 className="w-full"
//                             />
//                         </div>
//                         <div>
//                             <Input
//                                 required
//                                 name="phone"
//                                 type="tel"
//                                 placeholder="Phone *"
//                                 value={phone}
//                                 onChange={(e) => setPhone(e.target.value)}
//                                 className="w-full"
//                             />
//                         </div>
//                         <div>
//                             <Select value={pronouns} onValueChange={setPronouns}>
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Pronouns" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="he/him">he/him</SelectItem>
//                                     <SelectItem value="she/her">she/her</SelectItem>
//                                     <SelectItem value="they/them">they/them</SelectItem>
//                                     <SelectItem value="other">Other</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </div>
//                     <Button
//                         type="submit"
//                         className="w-full"
//                         disabled={!firstName || !lastName || !email || !phone}
//                     >
//                         Add Client
//                     </Button>
//                 </form>
//             </DialogContent>
//         </Dialog>
//     )
// }

"use client";

import * as React from "react";
import { useState, FormEventHandler } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-toastify"; // ✅ Toast Notifications

import { X, Plus, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const supabase = createClient();

interface AddClientDialogProps {
    onClose: () => void; // Callback function
}

export function AddClientDialogBox({ onClose }: AddClientDialogProps) {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [pronouns, setPronouns] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState(""); // ✅ Capture Password
    const [existingProfileId, setExistingProfileId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [emailExists, setEmailExists] = useState(false); // Track if email exists
    const [emailSearched, setEmailSearched] = useState(false); // Track if search is performed

    const [existingClient, setExistingClient] = useState<any>(null);
    const [isClientNew, setIsClientNew] = useState(false);


    // ✅ Function to send login credentials via email (mocked)
    const sendCredentialsEmail = async (email: string, tempPassword: string) => {
        console.log(`Email sent to ${email} with temp password: ${tempPassword}`);
        toast.success(`Login credentials sent to ${email}`);
    };

    // ✅ Check if profile exists before creating a new one
    const checkExistingProfile = async (email: string) => {
        setLoading(true);

        const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("email", email)
            .maybeSingle(); // ✅ Use maybeSingle() instead of single()

        if (error) {
            console.error("Error checking profile:", error.message);
            toast.error("Error checking profile. Please try again.");

            setExistingProfileId(null);
            setEmailExists(false);

            return;
        }


        if (data) {
            // ✅ Profile exists
            setExistingProfileId(data.id);
            setEmailExists(true);

            // ✅ Extract first name & last name
            const nameParts = data.full_name.split(" ");
            setFirstName(nameParts[0] || "");
            setLastName(nameParts.slice(1).join(" ") || "");

            setExistingClient(data);
            setIsClientNew(false);

            toast.info(`Client with email ${email} found.`);
        } else {
            // ✅ Profile does not exist
            setExistingProfileId(null);
            setEmailExists(false);

            setExistingClient(null);
            setIsClientNew(true);

            // ✅ New Client
            setFirstName("");
            setLastName("");
            setPhone("");
            setPronouns("");
            setPassword(""); // ✅ Only needed for new clients

            toast.info(`No existing client found with email ${email}.`);
        }

        setLoading(false);
    };


    // Handle search by email
    const handleSearch = async (email: string) => {
        if (!email) {
            toast.error("Please enter an email to search.");
            return;
        }
        await checkExistingProfile(email);
        setEmailSearched(true);
    };

    // ✅ Handle form submission
    const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        setLoading(true);
        const fullName = `${firstName} ${lastName}`;

        if (!email || !fullName || !phone || !pronouns) {
            toast.error("Please fill all required fields");
            setLoading(false);
            return;
        }

        let profileId = null;

        try {
            // Check for existing profile first
            await checkExistingProfile(email);

            // ✅ Step 1: If no existing profile, create an authentication account
            if (!emailExists || isClientNew) {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    // options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
                });

                if (authError) {
                    console.error("Signup Error:", authError.message);
                    toast.error(`Error signing up: ${authError.message}`);
                    setLoading(false);
                    return;
                }

                // ✅ Step 2: Insert user details into 'profiles' table
                const { data: newProfile, error: profileError } = await supabase
                    .from("profiles")
                    .insert({
                        id: authData.user!.id,
                        email,
                        full_name: fullName,
                        role: "client",
                    })
                    .select()
                    .single();

                if (profileError) {
                    toast.error(`Error creating profile: ${profileError.message}`);
                    setLoading(false);
                    return;
                }

                console.log("Profile for client has been created successfully!");

                // profileId = authData.user!.id; // ✅ Correct way to get profile ID 
                profileId = newProfile.id; // ✅ Correct way to get profile ID

                // ✅ Generate and send login credentials (mocked)
                await sendCredentialsEmail(email, password);
            }
            else {
                profileId = existingProfileId; // ✅ Use existing profile ID if found
            }

            console.log("Client profile id : ", profileId); // client => profile id

            // ✅ Step 3: Get Therapist ID
            const user = await supabase.auth.getUser();
            const therapistId = user.data?.user?.id;

            if (!therapistId) {
                console.error("Therapist ID is missing");
                toast.error("Therapist ID is missing");
                setLoading(false);
                return;
            }

            console.log("Therapist profile id : ", therapistId); // therapist => profile id

            // ✅ Step 4: Insert into clients table
            const { error: clientError } = await supabase.from("clients").insert({
                profile_id: profileId, // ✅ Use profileId from profiles table
                therapist_id: therapistId,
                phone_number: phone,
                pronouns: pronouns,
                status: "active",
            });

            if (clientError) {
                console.error("Error adding client", clientError);
                toast.error("Error adding client");
                setLoading(false);
                return;
            }

            console.log("Inserted Client and Therapist into clients created successfully!");

            toast.success(isClientNew ? "New client added successfully" : "Existing client linked successfully");
            router.refresh();
            onClose();
        } catch (error) {
            toast.error("Unexpected error occurred");
            console.error("Unexpected error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogTrigger asChild>
                <Button variant="default">
                    <Plus className="mr-2 h-4 w-4" />Add Client
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Add Client</DialogTitle>
                    <DialogDescription id="add-client-description">
                        {!emailSearched
                            ? "Enter an email and search before proceeding."
                            : emailExists
                                ? `Client with email ${email} found. Fill in missing details.`
                                : `No existing client found. You can create a new profile.`}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Input
                                name="email"
                                type="email"
                                placeholder="Enter client email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full"
                            />

                            <Button onClick={() => handleSearch(email)}
                                disabled={!email.trim() || loading}  // ✅ Disable until email is entered
                                className="bg-gray-600 text-white">
                                {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Search"}
                            </Button>
                        </div>

                        {/* Name Fields */}
                        <Input
                            name="firstName"
                            placeholder="First Name *"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            // disabled={!isClientNew}
                            disabled={!emailSearched} // ✅ Disable until email is searched
                        />
                        <Input
                            name="lastName"
                            placeholder="Last Name *"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            // disabled={!isClientNew}
                            disabled={!emailSearched} // ✅ Disable until email is searched
                        />

                        {/* Other Details */}
                        <Input
                            name="phone"
                            type="tel"
                            placeholder="Phone *"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={!emailSearched} // ✅ Disable until email is searched
                        />
                        {isClientNew && (
                            <Input
                                name="password"
                                type="password"
                                placeholder="Password *"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={!emailSearched} // ✅ Disable until email is searched
                            />
                        )}
                        <Select value={pronouns} onValueChange={setPronouns}
                            // disabled={loading}
                            disabled={!emailSearched} // ✅ Disable until email is searched
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pronouns" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="he/him">he/him</SelectItem>
                                <SelectItem value="she/her">she/her</SelectItem>
                                <SelectItem value="they/them">they/them</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        type="submit"
                        className={`w-full ${isClientNew ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"
                            } text-white`}
                        // disabled={loading}
                        disabled={!emailSearched || loading} // ✅ Disable until email is searched
                    >
                        {loading ? (
                            <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                        ) : !emailExists ? (
                            "Add a New Client"
                        ) : (
                            "Add an Existing Client"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
