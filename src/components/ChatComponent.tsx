'use client'
import React from 'react'
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Send} from "lucide-react"
import MessageList from '@/components/MessageList'
import {useChat} from "@ai-sdk/react";

type Props = {
    chatId: number
}

const ChatComponent = ({chatId}: Props) => {
    const {input, handleInputChange, handleSubmit, messages} = useChat({
        api: '/api/chat',
        body:{
            chatId: chatId
        }
    })

    React.useEffect(() =>{
        const messageContainer = document.getElementById('message-container')
        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: "smooth"
            })
        }
    })

    return (
        <div className="relative h-screen flex flex-col">
            <div className="sticky top-0 inset-x-0 p-4 bg-white shadow">
                <h3 className="text-2xl font-bold text-gray-800">Chatroom</h3>
            </div>
            <div id="message-container" className="flex-1 overflow-y-auto p-4">
                <MessageList messages={messages} />
            </div>
            <form onSubmit={handleSubmit} className="sticky bottom-0 inset-x-0 p-4 bg-white shadow-md">
                <div className="flex items-center space-x-2">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask anything"
                        className="flex-1"
                    />
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-4 py-2 rounded-md">
                        <Send className="h-5 w-5" />
                        <span className="ml-2">Send</span>
                    </Button>
                </div>
            </form>
        </div>
    );

    // return (
    //     <div className={'relative max-h-screen'}>
    //             <div className='sticky top-0 insert-x-0 p-2 px-2 bg-white h-fit'>
    //                 <h3 className='text-xl font-bold'>Chatroom</h3>
    //             </div>
    //             <MessageList messages={messages}/>
    //             <form onSubmit={handleSubmit} className='sticky bottom-0 insert-x-0 px-2 py-4 bg-white'>
    //                 <div className='flex'>
    //                     <Input
    //                         value={input}
    //                         onChange={handleInputChange}
    //                         placeholder="Ask anything"
    //                         className='w-full'
    //                     />
    //                     <Button className='bg-blue-600 ml-2'>
    //                         <Send className='h-4 w-4'/>
    //                     </Button>
    //                 </div>
    //             </form>
    //     </div>
    // )
}

export default ChatComponent