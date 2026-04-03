import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim(), type: "text" };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            messages: updatedMessages
              .filter(m => m.type === "text")
              .map(m => ({ role: m.role, content: m.content })),
            model: "Qwen/Qwen2.5-1.5B-Instruct:featherless-ai",
          }),
        }
      );

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        setMessages((prev) => [...prev, { ...data.choices[0].message, type: "text" }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Error: Unexpected response format from the AI.", type: "text" }]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to Hugging Face API.", type: "text" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!input.trim() || isLoading) return;

    const promptText = input.trim();
    const userMessage = { role: "user", content: `Generate image: ${promptText}`, type: "text" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://router.huggingface.co/nscale/v1/images/generations",
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            response_format: "b64_json",
            prompt: promptText,
            model: "stabilityai/stable-diffusion-xl-base-1.0",
          }),
        }
      );

      const data = await response.json();

      if (data.data && data.data[0] && data.data[0].b64_json) {
        const imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
        setMessages((prev) => [...prev, { role: "assistant", content: imageUrl, type: "image", prompt: promptText }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Failed to generate image.", type: "text" }]);
      }
    } catch (error) {
      console.error("Image Generation Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error generating image. Please try again.", type: "text" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nova-dashboard">
      <div className="mesh-background">
        <div className="gradient-sphere g-1"></div>
        <div className="gradient-sphere g-2"></div>
        <div className="gradient-sphere g-3"></div>
      </div>

      <nav className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 22H22L12 2Z" stroke="url(#gradient)" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M12 12V22" stroke="url(#gradient)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3" fill="#0ee3a3" filter="drop-shadow(0 0 8px #0ee3a3)" />
              <defs>
                <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#0ee3a3" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="brand-text">Nova AI</h1>
        </div>

        <button className="new-chat-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Session
        </button>

        <div className="history-section">
          <span className="history-title">Recent Threads</span>
          <div className="history-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"></path>
            </svg>
            <span className="history-text">Current Session</span>
          </div>
          <div className="history-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"></path>
            </svg>
            <span className="history-text">Understanding Physics</span>
          </div>
          <div className="history-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"></path>
            </svg>
            <span className="history-text">Code Architecture</span>
          </div>
        </div>

        <div className="user-profile">
          <div className="avatar user-avatar">T</div>
          <div className="user-details">
            <span className="user-name">Developer</span>
            <span className="user-plan">Pro License Active</span>
          </div>
        </div>
      </nav>

      <main className="chat-container">
        <header className="mobile-header">
          <h2>Nova AI</h2>
          <div className="status"><div className="status-dot"></div> Online</div>
        </header>

        <div className="chat-content">
          {messages.length === 0 ? (
            <div className="welcome-banner">
              <div className="glow-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="url(#star-grad)" />
                  <defs>
                    <linearGradient id="star-grad" x1="2" y1="2" x2="22" y2="22">
                      <stop stopColor="#3b82f6" />
                      <stop offset="1" stopColor="#0ee3a3" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h2 className="welcome-title">What can I help you create?</h2>
              <div className="suggestion-chips">
                <button className="chip" onClick={() => setInput("Explain quantum entanglement")}>
                  Explain quantum entanglement
                </button>
                <button className="chip" onClick={() => setInput("Help me refactor my React component")}>
                  Help me refactor my React component
                </button>
                <button className="chip" onClick={() => setInput("Write a poem about space travel")}>
                  Write a poem about space travel
                </button>
              </div>
            </div>
          ) : (
            <div className="messages-flow">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-group ${msg.role}`}>
                  <div className={`avatar ${msg.role === 'assistant' ? 'ai-avatar' : 'user-avatar'}`}>
                    {msg.role === 'assistant' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                        <circle cx="12" cy="5" r="2"></circle>
                        <path d="M12 7v4"></path>
                        <line x1="8" y1="16" x2="8" y2="16"></line>
                        <line x1="16" y1="16" x2="16" y2="16"></line>
                      </svg>
                    ) : 'T'}
                  </div>
                  <div className="message-content">
                    {msg.type === "image" ? (
                      <div className="generated-image-container">
                        <img src={msg.content} alt={msg.prompt} className="generated-image" />
                        <div className="image-overlay">
                          <button className="download-btn" onClick={() => {
                            const link = document.createElement("a");
                            link.href = msg.content;
                            link.download = `nova-ai-${Date.now()}.png`;
                            link.click();
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Save Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message-group assistant">
                  <div className="avatar ai-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                      <circle cx="12" cy="5" r="2"></circle>
                      <path d="M12 7v4"></path>
                    </svg>
                  </div>
                  <div className="message-content loading">
                    <span className="pulse"></span>
                    <span className="pulse"></span>
                    <span className="pulse"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="input-frame">
          <form className="nova-form" onSubmit={handleSend}>
            <div className="input-wrapper">
              <span className="input-prefix">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Nova anything..."
                disabled={isLoading}
                autoFocus
              />
              <button 
                type="button" 
                className={`nova-image-gen ${input.trim() ? 'active' : ''}`} 
                onClick={handleGenerateImage}
                disabled={!input.trim() || isLoading}
                title="Generate AI Image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </button>
              <button type="submit" className={`nova-submit ${input.trim() ? 'active' : ''}`} disabled={!input.trim() || isLoading}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            <p className="footer-note">Nova AI uses Hugging Face models. Always double check important information.</p>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
