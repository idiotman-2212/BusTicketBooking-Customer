import { http } from '../../utils/http';

// Lấy danh sách tin nhắn
const getChatMessages = (conversationId) => {
    return http.get(`/chats/${conversationId}/messages`);
};

// Gửi tin nhắn
const sendMessage = (conversationId, messageData) => {
    return http.post(`/chats/${conversationId}/send`, messageData);
};

// Bắt đầu cuộc hội thoại mới
const startConversation = (customerUsername, staffUsername) => {
    return http.post(`/chats/start`, null, {
        params: { customerUsername, staffUsername }
    });
};

export { getChatMessages, sendMessage, startConversation };
