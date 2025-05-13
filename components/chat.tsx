// "use client"

// import { useState, useRef, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { AudioLines, Mic, Send, Volume2, Info } from 'lucide-react'
// import { createClient } from "@/utils/supabase/client"
// import { Badge } from "@/components/ui/badge"

// interface Message {
//     client_id: string;
//     text_message: string | null;
//     recording_url: string | null;
//     emotions: string | null;
//     message_type: 'text' | 'recording';
//     event_date: string;
// }

// import { AssemblyAI } from 'assemblyai'

// const HUME_API_KEY = process.env.NEXT_PUBLIC_HUME_API_KEY;
// const HUME_WS_URL = `wss://api.hume.ai/v0/stream/models?apikey=${HUME_API_KEY}`;

// const getSignificantEmotions = (emotions: Array<{ name: string, score: number }>) => {
//     // Sort emotions by score and get top emotions with score > 0.1 (10%)
//     return emotions
//         .filter(e => e.score > 0.1)
//         .sort((a, b) => b.score - a.score)
//         .slice(0, 3)
//         .map(e => ({
//             name: e.name,
//             score: Math.round(e.score * 100)
//         }));
// };

// export function Chat({ initialMessages, clientId }: { initialMessages: Message[], clientId: string }) {
//     const supabase = createClient()

//     const [messages, setMessages] = useState<Message[]>(initialMessages)
//     const [input, setInput] = useState("")

//     const [isRecording, setIsRecording] = useState(false)
//     const [recordingTooLong, setRecordingTooLong] = useState(false)

//     const mediaRecorder = useRef<MediaRecorder | null>(null)

//     const audioChunks = useRef<Blob[]>([])

//     const wsRef = useRef<WebSocket | null>(null);

//     const [isConnected, setIsConnected] = useState(false);
//     const recordingStartTime = useRef<number>(0);


//     const client = new AssemblyAI({
//         apiKey: process.env.NEXT_PUBLIC_ASSEMBLY_AI_API_KEY!,
//     });


//     useEffect(() => {
//         const connectWebSocket = () => {
//             const ws = new WebSocket(HUME_WS_URL);

//             ws.onopen = () => {
//                 console.log('WebSocket connected');
//                 setIsConnected(true);
//             };

//             ws.onmessage = (event) => {
//                 try {
//                     if (!event.data) return; // Ignore empty messages

//                     const data = JSON.parse(event.data);

//                     // Handle errors separately to avoid unnecessary logs
//                     if (data.error) {
//                         // console.error("WebSocket Error:", data.error);
//                         return;
//                     }

//                     // Log data only if valid and meaningful
//                     if (data.language?.predictions || data.prosody?.predictions) {
//                         console.log("Received valid data:", data);
//                     }

//                     if (data.language?.predictions) {
//                         setMessages(prevMessages => {
//                             const updatedMessages = [...prevMessages];
//                             const lastMessage = updatedMessages[updatedMessages.length - 1];
//                             let is_inserted = false;

//                             if (is_inserted === false && lastMessage && data.language.predictions[0]?.emotions) {
//                                 const significantEmotions = getSignificantEmotions(data.language.predictions[0].emotions);
//                                 lastMessage.emotions = JSON.stringify(significantEmotions);

//                                 // Insert message in Supabase
//                                 const insertMessage = async () => {
//                                     // console.log('Inserting message in Supabase: ', lastMessage);

//                                     const { error: messageError } = await supabase
//                                         .from('messages')
//                                         .upsert(lastMessage, { onConflict: 'event_date' })
//                                         .single();

//                                     if (messageError) console.error(messageError);
//                                 }
//                                 insertMessage();
//                                 is_inserted = true;
//                             }
//                             return updatedMessages;
//                         });
//                     }
//                     else if (data.prosody?.predictions) {
//                         setMessages(prevMessages => {
//                             const updatedMessages = [...prevMessages];
//                             const lastMessage = updatedMessages[updatedMessages.length - 1];
//                             let is_inserted = false;

//                             if (is_inserted === false && lastMessage && data.prosody.predictions[0]?.emotions) {
//                                 const significantEmotions = getSignificantEmotions(data.prosody.predictions[0].emotions);
//                                 lastMessage.emotions = JSON.stringify(significantEmotions);

//                                 // Insert message in Supabase
//                                 const insertMessage = async () => {
//                                     // console.log('Inserting message in Supabase: ', lastMessage);

//                                     const { error: messageError } = await supabase
//                                         .from('messages')
//                                         .upsert(lastMessage, { onConflict: 'event_date' })
//                                         .single()

//                                     if (messageError) console.error(messageError);
//                                 }
//                                 insertMessage();
//                                 is_inserted = true;
//                             }
//                             return updatedMessages;
//                         });
//                     }
//                 } catch (error) {
//                     console.error('Error processing WebSocket message:', error);
//                 }
//             };

//             ws.onerror = (error) => {
//                 // console.error('WebSocket error:', error);
//                 setIsConnected(false);
//             };

//             ws.onclose = () => {
//                 console.log('WebSocket closed');
//                 setIsConnected(false);
//                 // Attempt to reconnect after a delay
//                 setTimeout(connectWebSocket, 3000);
//             };

//             wsRef.current = ws;

//             // Set up ping interval to prevent timeout
//             const pingInterval = setInterval(() => {
//                 if (ws.readyState === WebSocket.OPEN) {
//                     ws.send(JSON.stringify({ type: "ping" }));
//                 }
//             }, 45000); // Ping every 45 seconds

//             return () => {
//                 clearInterval(pingInterval);
//                 ws.close();
//             };
//         };

//         connectWebSocket();

//         return () => {
//             if (wsRef.current) {
//                 wsRef.current.close();
//             }
//         };
//     }, []);

//     const analyzeTextEmotions = async (text: string) => {
//         if (!wsRef.current || !isConnected) {
//             // throw new Error('WebSocket not connected');
//             console.error("WebSocket not connected");
//             return;
//         }

//         const payload = {
//             models: {
//                 language: {
//                     granularity: "sentence",
//                 },
//             },
//             raw_text: true,
//             data: text,
//         };

//         try {
//             console.log("Sending text analysis request:", payload);
//             wsRef.current.send(JSON.stringify(payload));
//         } catch (error) {
//             // console.error('Error sending text analysis request:', error);
//             console.error("Invalid JSON payload for text analysis:", error);
//             // throw error;
//         }
//     };

//     const analyzeAudioEmotions = async (audioBlob: Blob) => {
//         if (!wsRef.current || !isConnected) {
//             // throw new Error('WebSocket not connected');
//             console.error("WebSocket not connected");
//             return;
//         }

//         try {
//             const arrayBuffer = await audioBlob.arrayBuffer();
//             const base64Audio = Buffer.from(arrayBuffer).toString('base64');

//             const payload = {
//                 models: {
//                     prosody: {},
//                 },
//                 data: base64Audio,
//             };

//             console.log("Sending audio analysis request:", payload);
//             wsRef.current.send(JSON.stringify(payload));
//         } catch (error) {
//             // console.error('Error sending audio analysis request:', error);
//             console.error("Invalid JSON payload for audio analysis:", error);
//             // throw error;
//         }
//     };

//     const handleSendMessage = async () => {
//         if (input.trim()) {
//             try {
//                 const newMessage: Message = {
//                     client_id: clientId,
//                     text_message: input.trim(),
//                     recording_url: null,
//                     message_type: 'text',
//                     emotions: null, // Will be updated when we receive the prediction
//                     event_date: new Date().toISOString(),
//                 };
//                 setMessages([...messages, newMessage]);

//                 await analyzeTextEmotions(input.trim());

//                 setInput("");
//             } catch (error) {
//                 console.error('Error processing message:', error);
//             }
//         }
//     };

//     const handleStartRecording = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             mediaRecorder.current = new MediaRecorder(stream);
//             audioChunks.current = [];
//             recordingStartTime.current = Date.now();
//             setRecordingTooLong(false);

//             mediaRecorder.current.ondataavailable = (event) => {
//                 audioChunks.current.push(event.data);
//             };

//             mediaRecorder.current.onstop = async () => {
//                 const recordingDuration = Date.now() - recordingStartTime.current;
//                 const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });

//                 try {
//                     const fileName = `recording_${Date.now()}.wav`;
//                     const { data, error } = await supabase.storage
//                         .from('chat-recordings')
//                         .upload(fileName, audioBlob);

//                     if (error) throw error;

//                     const { data: { publicUrl } } = supabase.storage
//                         .from('chat-recordings')
//                         .getPublicUrl(fileName);

//                     const transcriptionConfig = {
//                         audio: publicUrl,
//                     };

//                     const transcript = await client.transcripts.transcribe(transcriptionConfig);
//                     const transcribedText = transcript.text || '';

//                     const newRecording: Message = {
//                         client_id: clientId,
//                         text_message: transcribedText,
//                         recording_url: publicUrl,
//                         emotions: null,
//                         message_type: 'recording',
//                         event_date: new Date().toISOString(),
//                     };

//                     setMessages([...messages, newRecording]);

//                     if (recordingDuration <= 5000) {
//                         await analyzeTextEmotions(transcribedText);  // 💥 analyze emotions from transcription
//                         await analyzeAudioEmotions(audioBlob);
//                     } else {
//                         setRecordingTooLong(true);

//                         // Still analyze emotions from transcription even if audio is too long
//                         await analyzeTextEmotions(transcribedText);

//                         // Save message to Supabase without emotions
//                         const { error: messageError } = await supabase
//                             .from('messages')
//                             .upsert(newRecording, { onConflict: 'event_date' })
//                             .single();

//                         if (messageError) console.error(messageError);
//                     }

//                 } catch (error) {
//                     console.error('Error processing recording:', error);
//                 }

//                 stream.getTracks().forEach(track => track.stop());
//             }

//             mediaRecorder.current.start();
//             setIsRecording(true);
//         } catch (error) {
//             console.error('Error starting recording:', error);
//         }
//     };

//     const handleStopRecording = () => {
//         if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
//             mediaRecorder.current.stop()
//             setIsRecording(false)
//         }
//     }


//     return (
//         <div className="bg-background rounded-lg shadow-sm border border-border">
//             <ScrollArea className="h-auto">
//                 <div className="p-4 space-y-4 ">
//                     {messages.map((message) => (
//                         <div key={message.event_date} className="flex justify-end">
//                             <div className="max-w-[80%] p-3 rounded-lg text-sm bg-muted">
//                                 <div className="flex items-center justify-between mb-1">
//                                     <span className="text-xs opacity-70">
//                                         {new Date(message.event_date).toLocaleString('en-US', {
//                                             month: 'short',
//                                             day: 'numeric',
//                                             hour: '2-digit',
//                                             minute: '2-digit'
//                                         })}
//                                     </span>
//                                     {message.message_type === 'recording' && (
//                                         <span className="ml-2">
//                                             <AudioLines className="h-3 w-3" />
//                                         </span>
//                                     )}
//                                 </div>
//                                 <p>{message.text_message}</p>
//                                 {message.emotions && (
//                                     <div className="mt-2">
//                                         <div className="text-xs opacity-70">
//                                             {JSON.parse(message.emotions).map((emotion: { name: string, score: number }, index: number) => (
//                                                 <span key={emotion.name}>
//                                                     {emotion.name}: {emotion.score}%
//                                                     {message.emotions && index < JSON.parse(message.emotions).length - 1 && ", "}
//                                                 </span>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                                 {/* {!message.emotions && recordingTooLong && (
//                                     <div className="flex items-center justify-center text-sm text-destructive">
//                                         <Info className="h-4 w-4 mr-2" />
//                                         For now, we only support short recordings under 5 seconds.
//                                     </div>
//                                 )} */}
//                             </div>
//                         </div>
//                     ))}

//                 </div>
//             </ScrollArea>
//             <div className="flex items-center p-4 border-t border-border">
//                 <Input
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     placeholder="Type your message..."
//                     onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
//                     className="flex-grow"
//                 />
//                 <Button onClick={handleSendMessage} size="icon" variant="ghost" className="ml-2">
//                     <Send className="h-4 w-4" />
//                 </Button>
//                 <Button
//                     onClick={isRecording ? handleStopRecording : handleStartRecording}
//                     size="icon"
//                     variant={isRecording ? "destructive" : "ghost"}
//                     className="ml-2"
//                 >
//                     <Mic className="h-4 w-4" />
//                 </Button>
//             </div>
//         </div>
//     )
// }

"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AudioLines, Mic, Send, Volume2, Info } from 'lucide-react'
import { createClient } from "@/utils/supabase/client"
import { Badge } from "@/components/ui/badge"


interface Message {
    client_id: string;
    text_message: string | null;
    recording_url: string | null;
    emotions: string | null;
    message_type: 'text' | 'recording';
    event_date: string;
    sender: 'bot' | 'user'
}

import { AssemblyAI } from 'assemblyai'

const HUME_API_KEY = process.env.NEXT_PUBLIC_HUME_API_KEY;
const HUME_WS_URL = `wss://api.hume.ai/v0/stream/models?apikey=${HUME_API_KEY}`;



const questions = {
    therapy: [
        "How have you been feeling emotionally today?",
        "Is there anything specific on your mind that you'd like to talk about?",
        "What are some things that have been stressing you out lately?",
    ],
    personalLife: [
        "How has your day been so far?",
        "Is there anything you are looking forward to this week?",
        "What have you been doing lately to unwind?",
    ],
    health: [
        "Have you been able to maintain a healthy routine recently?",
        "How are you feeling physically?",
        "Have you been getting enough sleep?",
    ],
    fitness: [
        "Are you keeping up with your fitness goals?",
        "What kind of workouts do you enjoy the most?",
        "How do you feel after your last workout?",
    ],
    hobbies: [
        "Have you had time for your hobbies recently?",
        "What hobbies or activities bring you joy?",
        "Is there any new hobby you've been wanting to try?",
    ],
    work: [
        "How is work going for you?",
        "Are there any projects you're excited about at work?",
        "Have you been managing your work-life balance well?",
    ],
    friendsAndFamily: [
        "How have you been spending time with your family or friends?",
        "Is there a recent memory with friends or family that stands out to you?",
        "How do you stay connected with your loved ones?",
    ],
    dailyLife: [
        "What did you do today?",
        "How do you typically structure your day?",
        "What’s something you’d like to do more often in your daily routine?",
    ],
};


const getSignificantEmotions = (emotions: Array<{ name: string, score: number }>) => {
    // Sort emotions by score and get top emotions with score > 0.1 (10%)
    return emotions
        .filter(e => e.score > 0.1)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(e => ({
            name: e.name,
            score: Math.round(e.score * 100)
        }));
};



export function Chat({ initialMessages, clientId }: { initialMessages: Message[], clientId: string }) {
    const supabase = createClient()

    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [input, setInput] = useState("")

    const [isRecording, setIsRecording] = useState(false)
    const [recordingTooLong, setRecordingTooLong] = useState(false)

    const mediaRecorder = useRef<MediaRecorder | null>(null)
    const audioChunks = useRef<Blob[]>([])
    const wsRef = useRef<WebSocket | null>(null);

    const [isConnected, setIsConnected] = useState(false);
    const recordingStartTime = useRef<number>(0);

    const [isFirstInteraction, setIsFirstInteraction] = useState(true)
    const topics = ['daily life', 'food', 'work', 'family', 'hobbies', 'goals', 'stress', 'self-esteem'];


    const client = new AssemblyAI({
        apiKey: process.env.NEXT_PUBLIC_ASSEMBLY_AI_API_KEY!,
    });


    useEffect(() => {

        if (isFirstInteraction) {
            handleFirstInteraction();
            setIsFirstInteraction(false);
        }

        const connectWebSocket = () => {
            const ws = new WebSocket(HUME_WS_URL);

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    if (!event.data) return; // Ignore empty messages

                    const data = JSON.parse(event.data);

                    // Handle errors separately to avoid unnecessary logs
                    if (data.error) {
                        // console.error("WebSocket Error:", data.error);
                        return;
                    }

                    // Log data only if valid and meaningful
                    if (data.language?.predictions || data.prosody?.predictions) {
                        console.log("Received valid data:", data);
                    }

                    if (data.language?.predictions) {
                        setMessages(prevMessages => {
                            const updatedMessages = [...prevMessages];
                            const lastMessage = updatedMessages[updatedMessages.length - 1];
                            let is_inserted = false;

                            if (is_inserted === false && lastMessage && lastMessage.sender === 'user' && data.language.predictions[0]?.emotions) {
                                const significantEmotions = getSignificantEmotions(data.language.predictions[0].emotions);
                                lastMessage.emotions = JSON.stringify(significantEmotions);

                                // Insert message in Supabase
                                const insertMessage = async () => {
                                    // console.log('Inserting message in Supabase: ', lastMessage);

                                    const { error: messageError } = await supabase
                                        .from('messages')
                                        .upsert(lastMessage, { onConflict: 'event_date' })
                                        .single();

                                    if (messageError) console.error(messageError);
                                }

                                insertMessage();

                                is_inserted = true;
                            }
                            return updatedMessages;
                        });
                    }
                    else if (data.prosody?.predictions) {
                        setMessages(prevMessages => {
                            const updatedMessages = [...prevMessages];
                            const lastMessage = updatedMessages[updatedMessages.length - 1];
                            let is_inserted = false;

                            if (is_inserted === false && lastMessage && data.prosody.predictions[0]?.emotions) {
                                const significantEmotions = getSignificantEmotions(data.prosody.predictions[0].emotions);
                                lastMessage.emotions = JSON.stringify(significantEmotions);

                                // Insert message in Supabase
                                const insertMessage = async () => {
                                    // console.log('Inserting message in Supabase: ', lastMessage);

                                    const { error: messageError } = await supabase
                                        .from('messages')
                                        .upsert(lastMessage, { onConflict: 'event_date' })
                                        .single()

                                    if (messageError) {
                                        console.error(messageError);
                                    }
                                }
                                insertMessage();
                                is_inserted = true;
                            }
                            return updatedMessages;
                        });
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                // console.error('WebSocket error:', error);
                setIsConnected(false);
            };

            ws.onclose = () => {
                console.log('WebSocket closed');
                setIsConnected(false);
                // Attempt to reconnect after a delay
                setTimeout(connectWebSocket, 3000);
            };

            wsRef.current = ws;

            // Set up ping interval to prevent timeout
            const pingInterval = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "ping" }));
                }
            }, 45000); // Ping every 45 seconds

            return () => {
                clearInterval(pingInterval);
                ws.close();
            };
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [isFirstInteraction]);


    // Function to generate the first interaction
    const handleFirstInteraction = async () => {
        const lastGreetedDate = localStorage.getItem('lastGreetedDate');
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

        if (lastGreetedDate === today) {
            // console.log('User has already been greeted today.');
            return; // Skip greeting if already greeted today
        }

        // Save today's date in local storage
        localStorage.setItem('lastGreetedDate', today);

        const greeting = `Hello there! Welcome to your therapy session.`;

        const botMessage: Message = {
            client_id: clientId,
            text_message: greeting,
            recording_url: null,
            emotions: null,
            message_type: 'text',
            event_date: new Date().toISOString(),
            sender: 'bot',
        };

        setMessages((prev) => [...prev, botMessage]);
        await supabase.from('messages').insert(botMessage);

        // Ask a basic question after greeting
        const basicQuestion = await getNextQuestion()

        if (basicQuestion) {
            const questionMessage: Message = {
                client_id: clientId,
                text_message: basicQuestion,
                recording_url: null,
                emotions: null,
                message_type: 'text',
                event_date: new Date().toISOString(),
                sender: 'bot',
            };

            setMessages((prev) => [...prev, questionMessage]);
            await supabase.from('messages').insert(questionMessage);
        }
    };


    // Add a state to track the current category and question index
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0); // Tracks the current category
    const [questionIndex, setQuestionIndex] = useState<{ [key: string]: number }>({}); // Tracks the question index for each category

    // Function to get the next question sequentially from all categories
    const getNextQuestion = (): string | null => {
        const categories = Object.keys(questions); // Get all category keys
        if (categories.length === 0) return null; // Return null if no categories exist

        // Get the current category based on the currentCategoryIndex
        const selectedCategory = categories[currentCategoryIndex];
        const categoryQuestions = questions[selectedCategory as keyof typeof questions]; // Get questions for the current category

        if (!categoryQuestions || categoryQuestions.length === 0) return null; // Return null if no questions in the category

        // Get the current index for the selected category, default to 0
        const currentIndex = questionIndex[selectedCategory] || 0;

        // Get the question at the current index
        const nextQuestion = categoryQuestions[currentIndex];

        // Update the question index for the current category
        const nextIndex = currentIndex + 1;

        // If we've reached the end of the questions in the current category, move to the next category
        if (nextIndex >= categoryQuestions.length) {
            setCurrentCategoryIndex((prevIndex) => (prevIndex + 1) % categories.length); // Cycle back to the first category if at the end
            setQuestionIndex((prev) => ({
                ...prev,
                [selectedCategory]: 0, // Reset the question index for the current category
            }));
        } else {
            // Otherwise, just update the question index for the current category
            setQuestionIndex((prev) => ({
                ...prev,
                [selectedCategory]: nextIndex,
            }));
        }

        return nextQuestion;
    };


    const analyzeTextEmotions = async (text: string) => {
        if (!wsRef.current || !isConnected) {
            // throw new Error('WebSocket not connected');
            console.error("WebSocket not connected");
            return;
        }

        const payload = {
            models: {
                language: {
                    granularity: "sentence",
                },
            },
            raw_text: true,
            data: text,
        };

        try {
            console.log("Sending text analysis request:", payload);
            wsRef.current.send(JSON.stringify(payload));
        } catch (error) {
            // console.error('Error sending text analysis request:', error);
            console.error("Invalid JSON payload for text analysis:", error);
            // throw error;
        }
    };

    const analyzeAudioEmotions = async (audioBlob: Blob) => {
        if (!wsRef.current || !isConnected) {
            // throw new Error('WebSocket not connected');
            console.error("WebSocket not connected");
            return;
        }

        try {
            const arrayBuffer = await audioBlob.arrayBuffer();
            const base64Audio = Buffer.from(arrayBuffer).toString('base64');

            const payload = {
                models: {
                    prosody: {},
                },
                data: base64Audio,
            };

            console.log("Sending audio analysis request:", payload);
            wsRef.current.send(JSON.stringify(payload));
        } catch (error) {
            // console.error('Error sending audio analysis request:', error);
            console.error("Invalid JSON payload for audio analysis:", error);
            // throw error;
        }
    };

    const handleSendMessage = async () => {
        if (input.trim()) {
            try {
                const newMessage: Message = {
                    client_id: clientId,
                    text_message: input.trim(),
                    recording_url: null,
                    message_type: 'text',
                    emotions: null, // Will be updated when we receive the prediction
                    event_date: new Date().toISOString(),
                    sender: 'user',
                };

                // Add the message to the state
                setMessages((prevMessages) => [...prevMessages, newMessage]);

                // Save the message to Supabase
                const { error: messageError } = await supabase
                    .from('messages')
                    .insert(newMessage);

                if (messageError) {
                    console.error('Error saving user message to Supabase:', messageError);
                }

                // Analyze emotions from user response
                await analyzeTextEmotions(input.trim());

                // Clear the input field
                setInput("");

                // Delay the bot's response
                setTimeout(async () => {
                    const nextQuestion = getNextQuestion();

                    if (nextQuestion) {
                        const botMessage: Message = {
                            client_id: clientId,
                            text_message: nextQuestion,
                            recording_url: null,
                            emotions: null,
                            message_type: 'text',
                            event_date: new Date().toISOString(),
                            sender: 'bot',
                        };

                        // Add the bot message to the state
                        setMessages((prevMessages) => [...prevMessages, botMessage]);

                        // Save the bot message to Supabase
                        const { error: botMessageError } = await supabase
                            .from('messages')
                            .insert(botMessage);

                        if (botMessageError) {
                            console.error('Error saving bot message to Supabase:', botMessageError);
                        }
                    }
                }, 5000); // 3-second delay
            } catch (error) {
                console.error('Error processing message:', error);
            }
        }
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];
            recordingStartTime.current = Date.now();
            setRecordingTooLong(false);

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = async () => {
                const recordingDuration = Date.now() - recordingStartTime.current;
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });

                try {
                    const fileName = `recording_${Date.now()}.wav`;
                    const { data, error } = await supabase.storage
                        .from('chat-recordings')
                        .upload(fileName, audioBlob);

                    if (error) throw error;

                    const { data: { publicUrl } } = supabase.storage
                        .from('chat-recordings')
                        .getPublicUrl(fileName);

                    const transcriptionConfig = {
                        audio: publicUrl,
                    };

                    const transcript = await client.transcripts.transcribe(transcriptionConfig);
                    const transcribedText = transcript.text || '';

                    const newRecording: Message = {
                        client_id: clientId,
                        text_message: transcribedText,
                        recording_url: publicUrl,
                        emotions: null,
                        message_type: 'recording',
                        event_date: new Date().toISOString(),
                        sender: 'user',
                    };

                    setMessages([...messages, newRecording]);

                    if (recordingDuration <= 5000) {
                        await analyzeTextEmotions(transcribedText);  // 💥 analyze emotions from transcription
                        await analyzeAudioEmotions(audioBlob);
                    } else {
                        setRecordingTooLong(true);

                        // Still analyze emotions from transcription even if audio is too long
                        await analyzeTextEmotions(transcribedText);

                        // Save message to Supabase without emotions
                        const { error: messageError } = await supabase
                            .from('messages')
                            .upsert(newRecording, { onConflict: 'event_date' })
                            .single();

                        if (messageError) {
                            console.error(messageError);
                            return;
                        }
                    }

                } catch (error) {
                    console.error('Error processing recording:', error);
                }

                stream.getTracks().forEach(track => track.stop());
            }

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
            mediaRecorder.current.stop()
            setIsRecording(false)
        }
    }


    return (
        <div className="bg-background rounded-lg shadow-sm border border-border">
            <ScrollArea className="h-auto">
                <div className="p-4 space-y-4 ">
                    {messages.map((message, index) => (
                        <div key={message.event_date} className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-lg text-base ${message.sender === 'bot' ? 'bg-green-300' : 'bg-blue-400 text-white'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs opacity-70">
                                        {new Date(message.event_date).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                    {message.message_type === 'recording' && (
                                        <span className="ml-2">
                                            <AudioLines className="h-3 w-3" />
                                        </span>
                                    )}
                                </div>
                                <p>{message.text_message}</p>
                                {message.emotions && (
                                    <div className="mt-2">
                                        <div className="text-xs opacity-70">
                                            {JSON.parse(message.emotions).map((emotion: { name: string, score: number }, index: number) => (
                                                <span key={emotion.name}>
                                                    {emotion.name}: {emotion.score}%
                                                    {message.emotions && index < JSON.parse(message.emotions).length - 1 && ", "}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* {!message.emotions && recordingTooLong && (
                                    <div className="flex items-center justify-center text-sm text-destructive">
                                        <Info className="h-4 w-4 mr-2" />
                                        For now, we only support short recordings under 5 seconds.
                                    </div>
                                )} */}
                            </div>
                        </div>
                    ))}

                </div>
            </ScrollArea>
            <div className="flex items-center p-4 border-t border-border">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-grow"
                />
                <Button onClick={handleSendMessage} size="icon" variant="ghost" className="ml-2">
                    <Send className="h-4 w-4" />
                </Button>
                <Button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    size="icon"
                    variant={isRecording ? "destructive" : "ghost"}
                    className="ml-2"
                >
                    <Mic className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

