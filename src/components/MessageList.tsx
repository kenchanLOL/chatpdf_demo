import React from 'react'
import {Message} from '@ai-sdk/ui-utils'
import {cn} from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

type Props = {
    messages: Message[]
}

const MessageList = ({messages} : Props) => {
    if (!messages) return <></>
    return (
        <div className='flex flex-col gap-2 px-4 py-5'>
            {messages.map((message)=>{
                return (
                    <div
                        key={message.id}
                        className={cn("flex", {
                            "justify-end pl-10": message.role === "user",
                            "justify-start pr-10": message.role === "assistant",
                        })}
                    >
                        <div
                            className={cn(
                                "rounded-lg px-3 text-m p-3 shadow-md ring-1 ring-gray-900/10",
                                {
                                    "bg-blue-600 text-white": message.role === "user"
                                }
                            )}
                        >
                        <ReactMarkdown className="markdown">{message.content}</ReactMarkdown>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default MessageList