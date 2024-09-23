// src/scenes/Chat.jsx
import React, { useEffect, useState } from 'react';
import { IconButton, Paper, TextField, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { getChatMessages, sendMessage, startConversation } from '../../queries/chat/chatQueries';

const Chat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversationId, setConversationId] = useState(null);
    
    const customerUsername = localStorage.getItem('loggedInUsername') || 'unknown';
    const staffUsername = "actualStaffUsername"; // Lấy từ context hoặc API nếu cần

    useEffect(() => {
        const fetchChat = async () => {
            if (conversationId) {
                const response = await getChatMessages(conversationId);
                setMessages(response.data);
            } else {
                const conversation = await startConversation(customerUsername, staffUsername);
                setConversationId(conversation.id);
            }
        };
        fetchChat();
    }, [conversationId]);

    const handleSendMessage = async () => {
        if (newMessage.trim()) {
            const messageData = { sender: customerUsername, content: newMessage };
            await sendMessage(conversationId, messageData);
            setMessages(prev => [...prev, messageData]);
            setNewMessage('');
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
            <IconButton onClick={() => setIsOpen(!isOpen)}>
                <ChatIcon />
            </IconButton>
            {isOpen && (
                <Paper style={{ padding: 20, width: 300 }}>
                    <div>
                        {messages.map((msg, index) => (
                            <div key={index}>
                                <strong>{msg.sender}: </strong>{msg.content}
                            </div>
                        ))}
                    </div>
                    <TextField
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        fullWidth
                        placeholder="Type a message..."
                    />
                    <Button onClick={handleSendMessage} color='success'>Send</Button>
                </Paper>
            )}
        </div>
    );
};

export default Chat;
